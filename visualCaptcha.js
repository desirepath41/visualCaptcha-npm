/* jshint node: true */
'use strict';

var _ = require( 'underscore' ),
    crypto = require( 'crypto' ),
    visualCaptcha;

visualCaptcha = {
    // Session namespace, used for filtering session data across multiple captchas
    namespace: 'visualcaptcha',

    // Object that will have a reference for the session object
    // It will have .visualCaptcha.images, .visualCaptcha.audios, .visualCaptcha.validImageOption, and .visualCaptcha.validAudioOption
    session: {},

    // All the image options.
    // These can be easily overwritten or extended using addImageOptions( <Array> ), or replaceImageOptions( <Array> )
    // By default, they're populated using the ./images.json file
    imageOptions: [],

    // All the audio options.
    // These can be easily overwritten or extended using addImageOptions( <Array> ), or replaceImageOptions( <Array> )
    // By default, they're populated using the ./audios.json file
    audioOptions: [],

    // Generate a new valid option
    // @param numberOfOptions is optional. Defaults to 5
    generate: function( numberOfOptions ) {
        var visualCaptchaSession = this.session[ this.namespace ],
            imageValues = [];

        // Avoid the next IF failing if a string with a number is sent
        numberOfOptions = parseInt( numberOfOptions, 10 );

        // If it's not a valid number, default to 5
        if ( ! numberOfOptions || ! _.isNumber(numberOfOptions) || isNaN(numberOfOptions) ) {
            numberOfOptions = 5;
        }

        // Set the minimum numberOfOptions to four
        if ( numberOfOptions < 4 ) {
            numberOfOptions = 4;
        }

        // Shuffle all imageOptions
        this.imageOptions = _.shuffle( this.imageOptions );

        // Get a random sample of X images
        visualCaptchaSession.images = _.sample( this.imageOptions, numberOfOptions );

        // Set a random value for each of the images, to be used in the frontend
        visualCaptchaSession.images.forEach( function( image, index ) {
            var randomValue = crypto.randomBytes( 20 ).toString( 'hex' );

            imageValues.push( randomValue );
            visualCaptchaSession.images[ index ].value = randomValue;
        });

        // Select a random image option, pluck current valid image option
        visualCaptchaSession.validImageOption = _.sample(
            _.without( visualCaptchaSession.images, visualCaptchaSession.validImageOption )
        );

        // Select a random audio option, pluck current valid audio option
        visualCaptchaSession.validAudioOption = _.sample(
            _.without( this.audioOptions, visualCaptchaSession.validAudioOption )
        );

        // Set random hashes for audio and image field names, and add it in the frontend data object
        visualCaptchaSession.frontendData = {
            values: imageValues,
            imageName: this.getValidImageOption().name,
            imageFieldName: crypto.randomBytes( 20 ).toString( 'hex' ),
            audioFieldName: crypto.randomBytes( 20 ).toString( 'hex' )
        };
    },

    // Get data to be used by the frontend
    getFrontendData: function() {
        var visualCaptchaSession = this.session[ this.namespace ],
            frontendData = visualCaptchaSession.frontendData;

        return frontendData;
    },

    // Get the current validImageOption
    getValidImageOption: function() {
        var visualCaptchaSession = this.session[ this.namespace ];

        return visualCaptchaSession.validImageOption;
    },

    // Get the current validAudioOption
    getValidAudioOption: function() {
        var visualCaptchaSession = this.session[ this.namespace ];

        return visualCaptchaSession.validAudioOption;
    },

    // Validate the sent image value with the validImageOption
    validateImage: function( sentOption ) {
        return ( sentOption === this.getValidImageOption().value );
    },

    // Validate the sent audio value with the validAudioOption
    validateAudio: function( sentOption ) {
        return ( sentOption === this.getValidAudioOption().value );
    },

    // Return generated image options
    getImageOptions: function() {
        var generatedImageOptions = this.session[ this.namespace ].images;

        return generatedImageOptions;
    },

    // Return generated image option at index
    getImageOptionAtIndex: function(index) {
        var images = this.getImageOptions(),
            generatedImageOption = images && images[ index ];

        return generatedImageOption;
    },

    // Alias for getValidAudioOption
    getAudioOption: function() {
        return this.getValidAudioOption();
    },

    // Return all the image options
    getAllImageOptions: function() {
        return this.imageOptions;
    },

    // Return all the audio options
    getAllAudioOptions: function() {
        return this.audioOptions;
    },

    // Stream audio file
    // @param response Node's response object
    // @param fileType defaults to 'mp3', can also be 'ogg'
    streamAudio: function( response, fileType ) {
        var fs = require( 'fs' ),
            mime = require( 'mime' ),
            audioOption = this.getValidAudioOption(),
            audioFileName = audioOption ? audioOption.path : '',// If there's no audioOption, we set the file name as empty
            audioFilePath = __dirname + '/audios/' + audioFileName,
            mimeType,
            stream;

        // If the file name is empty, we skip any work and return a 404 response
        if ( audioFileName ) {
            // We need to replace '.mp3' with '.ogg' if the fileType === 'ogg'
            if ( fileType === 'ogg' ) {
                audioFileName = audioFileName.replace( /\.mp3/gi, '.ogg' );
                audioFilePath = audioFilePath.replace( /\.mp3/gi, '.ogg' );
            } else {
                fileType = 'mp3';// This isn't doing anything, really, but I feel better with it
            }

            fs.exists( audioFilePath, function( exists ) {
                if ( exists ) {
                    mimeType = mime.lookup( audioFilePath );

                    // Set the appropriate mime type
                    response.set( 'content-type', mimeType );

                    // Make sure this is not cached
                    response.set( 'cache-control', 'no-cache, no-store, must-revalidate' );
                    response.set( 'pragma', 'no-cache' );
                    response.set( 'expires', 0 );

                    stream = fs.createReadStream( audioFilePath );
                    var responseData = [];

                    if ( stream ) {
                        stream.on( 'data', function( chunk ) {
                          responseData.push( chunk );
                        });

                        stream.on( 'end', function() {
                            if ( ! response.headerSent ) {
                                var finalData = Buffer.concat( responseData );
                                response.write( finalData );

                                // Add some noise randomly, so audio files can't be saved and matched easily by filesize or checksum
                                var noiseData = crypto.randomBytes(Math.round((Math.random() * 1999)) + 501).toString('hex');
                                response.write( noiseData );

                                response.end();
                            }
                        });

                        stream.on( 'close', function() {
                            if ( ! response.headerSent ) {
                                var finalData = Buffer.concat( responseData );
                                response.write( finalData );

                                // Add some noise randomly, so audio files can't be saved and matched easily by filesize or checksum
                                var noiseData = crypto.randomBytes(Math.round((Math.random() * 1999)) + 501).toString('hex');
                                response.write( noiseData );

                                response.end();
                            }
                        });
                    } else {
                        response.status( 404 ).send( 'Not Found' );
                    }
                } else {
                    response.status( 404 ).send( 'Not Found' );
                }
            });
        } else {
            response.status( 404 ).send( 'Not Found' );
        }
    },

    // Stream image file given an index in the session visualCaptcha images array
    // @param index of the image in the session images array to send
    // @param response Node's response object
    // @paran isRetina boolean. Defaults to false
    streamImage: function( index, response, isRetina ) {
        var fs = require( 'fs' ),
            imageOption = this.getImageOptionAtIndex( index ),
            imageFileName = imageOption ? imageOption.path : '',// If there's no imageOption, we set the file name as empty
            imageFilePath = __dirname + '/images/' + imageFileName,
            mime = require( 'mime' ),
            mimeType,
            stream;

        // Force boolean for isRetina
        if ( ! isRetina ) {
            isRetina = false;
        } else {
            isRetina = true;
        }

        // If retina is requested, change the file name
        if ( isRetina ) {
            imageFileName = imageFileName.replace( /\.png/gi, '@2x.png' );
            imageFilePath = imageFilePath.replace( /\.png/gi, '@2x.png' );
        }

        // If the index is non-existent, the file name will be empty, same as if the options weren't generated
        if ( imageFileName ) {
            fs.exists( imageFilePath, function( exists ) {
                if ( exists ) {
                    mimeType = mime.lookup( imageFilePath );

                    // Set the appropriate mime type
                    response.set( 'content-type', mimeType );

                    // Make sure this is not cached
                    response.set( 'cache-control', 'no-cache, no-store, must-revalidate' );
                    response.set( 'pragma', 'no-cache' );
                    response.set( 'expires', 0 );

                    stream = fs.createReadStream( imageFilePath );
                    var responseData = [];

                    if ( stream ) {
                        stream.on( 'data', function( chunk ) {
                          responseData.push( chunk );
                        });

                        stream.on( 'end', function() {
                            if ( ! response.headerSent ) {
                                var finalData = Buffer.concat( responseData );
                                response.write( finalData );

                                // Add some noise randomly, so images can't be saved and matched easily by filesize or checksum
                                var noiseData = crypto.randomBytes(Math.round((Math.random() * 1999)) + 501).toString('hex');
                                response.write( noiseData );

                                response.end();
                            }
                        });

                        stream.on( 'close', function() {
                            if ( ! response.headerSent ) {
                                var finalData = Buffer.concat( responseData );
                                response.write( finalData );

                                // Add some noise randomly, so images can't be saved and matched easily by filesize or checksum
                                var noiseData = crypto.randomBytes(Math.round((Math.random() * 1999)) + 501).toString('hex');
                                response.write( noiseData );

                                response.end();
                            }
                        });
                    } else {
                        response.status( 404 ).send( 'Not Found' );
                    }
                } else {
                    response.status( 404 ).send( 'Not Found' );
                }
            });
        } else {
            response.status( 404 ).send( 'Not Found' );
        }


    }
};

// @param session is the default session object
// @param defaultImages is optional. Defaults to the array inside ./images.json. The path is relative to ./images/
// @param defaultAudios is optional. Defaults to the array inside ./audios.json. The path is relative to ./audios/
module.exports = function( session, namespace, defaultImages, defaultAudios ) {
    var captcha = {};

    // Throw an error if no session object is passed
    if ( typeof session !== 'object' || ! session ) {
        throw {
            name: 'visualCaptchaException',
            message: 'Cannot initialize visualCaptcha without a valid session object!'
        };
    }

    // Extend the visualCaptcha object
    _.extend( captcha, visualCaptcha );

    // If namespace is present, use it
    if ( namespace && namespace.length !== 0 ) {
        captcha.namespace = 'visualcaptcha_' + namespace;
    }

    // Attach the session object reference to visualCaptcha
    captcha.session = session;

    // Start a new object that will hold visualCaptcha's data for the session
    captcha.session[ captcha.namespace ] = captcha.session[ captcha.namespace ] || {};

    // If there are no defaultImages, get them from ./images.json
    if ( ! defaultImages || defaultImages.length === 0 ) {
        defaultImages = require( './images.json' );
    }

    // If there are no defaultAudios, get them from ./audios.json
    if ( ! defaultAudios || defaultAudios.length === 0 ) {
        defaultAudios = require( './audios.json' );
    }

    // Attach the images object reference to visualCaptcha
    captcha.imageOptions = defaultImages;

    // Attach the audios object reference to visualCaptcha
    captcha.audioOptions = defaultAudios;

    return captcha;
};