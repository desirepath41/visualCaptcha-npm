/* jshint node: true */
/* global describe, it, before, beforeEach, after, afterEach */
'use strict';

var visualCaptchaPath = './../../visualCaptcha.js',
    should = require( 'should' ),
    fs = require( 'fs' ),
    sinon = require( 'sinon' ),
    request = require( 'supertest' ),
    _ = require( 'underscore' );

describe( 'visualCaptcha', function() {
    var visualCaptcha,
        sessionMock = {},
        containsObject;

    // Helper function to check if an object exists in an array
    containsObject = function( object, array ) {
        var matchFound;

        matchFound = _.find( array, function( arrayElement ) {
            return _.isEqual( object, arrayElement );
        });

        if ( _.isObject(matchFound) ) {
            return true;
        }

        return false;
    };

    // Runs before each test
    beforeEach( function() {
        // Set a new "session" every time
        sessionMock = {};

        // Start visualCaptcha with that new session
        visualCaptcha = require( visualCaptchaPath )( sessionMock );
    });

    // Test setup exceptions
    describe( 'setup', function() {
        var validExceptionName = 'visualCaptchaException',
            validExceptionMessage = 'Cannot initialize visualCaptcha without a valid session object!';

        it( 'should throw an exception if no valid session object is sent: null', function() {
            should( function() {
                visualCaptcha = require( visualCaptchaPath )( null );
            }).throw({
                name: validExceptionName,
                message: validExceptionMessage
            });
        });

        it( 'should throw an exception if no valid session object is sent: false', function() {
            should( function() {
                visualCaptcha = require( visualCaptchaPath )( false );
            }).throw({
                name: validExceptionName,
                message: validExceptionMessage
            });
        });

        it( 'should throw an exception if no valid session object is sent: 0', function() {
            should( function() {
                visualCaptcha = require( visualCaptchaPath )( 0 );
            }).throw({
                name: validExceptionName,
                message: validExceptionMessage
            });
        });

        it( 'should throw an exception if no valid session object is sent: undefined', function() {
            should( function() {
                visualCaptcha = require( visualCaptchaPath )( undefined );
            }).throw({
                name: validExceptionName,
                message: validExceptionMessage
            });
        });

        it( 'should allow an array to be used instead of the default images for options', function() {
            var imageOptions = [
                    {
                        name: 'Test',
                        path: 'test.png'
                    }
                ],
                obtainedImages;

            visualCaptcha = require( visualCaptchaPath )( sessionMock, false, imageOptions );

            obtainedImages = visualCaptcha.getAllImageOptions();

            should.exist( obtainedImages );

            obtainedImages.should.have.lengthOf( 1 );

            // Check the obtained image is the same we sent over
            obtainedImages[ 0 ].should.have.property( 'name' );
            obtainedImages[ 0 ].should.have.property( 'path' );

            obtainedImages[ 0 ].name.should.equal( 'Test' );
            obtainedImages[ 0 ].path.should.equal( 'test.png' );
        });

        it( 'should allow an array to be used instead of the default audios for options', function() {
            var audioOptions = [
                    {
                        path: 'test.mp3',
                        value: 'test'
                    }
                ],
                obtainedAudios;

            visualCaptcha = require( visualCaptchaPath )( sessionMock, false, false, audioOptions );

            obtainedAudios = visualCaptcha.getAllAudioOptions();

            should.exist( obtainedAudios );

            obtainedAudios.should.have.lengthOf( 1 );

            // Check the obtained audio is the same we sent over
            obtainedAudios[ 0 ].should.have.property( 'path' );
            obtainedAudios[ 0 ].should.have.property( 'value' );

            obtainedAudios[ 0 ].path.should.equal( 'test.mp3' );
            obtainedAudios[ 0 ].value.should.equal( 'test' );
        });
    });

    describe( '.getAllImageOptions()', function() {
        it( 'should return the list with all the possible image options', function() {
            var imageOptions = visualCaptcha.getAllImageOptions();

            should.exist( imageOptions );

            // We should have at least 20 image options, so probability plays a role
            imageOptions.length.should.be.above( 19 );

            // Images need to have a name
            imageOptions[ 0 ].should.have.property( 'name' );

            // Images need to have a path
            imageOptions[ 0 ].should.have.property( 'path' );
        });

        it( 'should find all the files for all the images, and their retina versions, making sure they\'re not empty', function() {
            var fs = require( 'fs' ),
                imageOptions = visualCaptcha.getAllImageOptions(),
                imageOptionsLength = imageOptions.length,
                i,
                currentImagePath,
                currentImageStats;

            for ( i = 0; i < imageOptionsLength; ++i ) {
                currentImagePath = __dirname + '/../../images/' + imageOptions[ i ].path;

                // Check the image file exists
                fs.existsSync( currentImagePath ).should.equal( true );

                // Check the image file is a file and is not empty
                currentImageStats = fs.statSync( currentImagePath );
                currentImageStats.isFile().should.equal( true );
                currentImageStats.size.should.be.above( 0 );

                // Check the retina image file exists
                currentImagePath = currentImagePath.replace( '.png', '@2x.png' );
                fs.existsSync( currentImagePath ).should.equal( true );

                // Check the retina image file is a file and is not empty
                currentImageStats = fs.statSync( currentImagePath );
                currentImageStats.isFile().should.equal( true );
                currentImageStats.size.should.be.above( 0 );
            }

            // Make sure we went through the whole array
            i.should.equal( imageOptionsLength );
        });
    });

    describe( '.getAllAudioOptions()', function() {
        it( 'should return the list with all the possible audio options', function() {
            var audioOptions = visualCaptcha.getAllAudioOptions();

            should.exist( audioOptions );

            // It should be an array
            audioOptions.should.be.an.instanceOf( Array );

            // We should have at least 20 image options, so probability plays a role
            audioOptions.length.should.be.above( 19 );

            // Audios need to have a path
            audioOptions[ 0 ].should.have.property( 'path' );

            // Audios need to have a value
            audioOptions[ 0 ].should.have.property( 'value' );
        });

        it( 'should find all the files for all the audios, and their .ogg versions, making sure they\'re not empty', function() {
            var fs = require( 'fs' ),
                imageOptions = visualCaptcha.getAllImageOptions(),
                imageOptionsLength = imageOptions.length,
                i,
                currentImagePath,
                currentImageStats;

            for ( i = 0; i < imageOptionsLength; ++i ) {
                currentImagePath = __dirname + '/../../images/' + imageOptions[ i ].path;

                // Check the image file exists
                fs.existsSync( currentImagePath ).should.equal( true );

                // Check the image file is a file and is not empty
                currentImageStats = fs.statSync( currentImagePath );
                currentImageStats.isFile().should.equal( true );
                currentImageStats.size.should.be.above( 0 );

                // Check the retina image file exists
                currentImagePath = currentImagePath.replace( '.png', '@2x.png' );
                fs.existsSync( currentImagePath ).should.equal( true );

                // Check the retina image file is a file and is not empty
                currentImageStats = fs.statSync( currentImagePath );
                currentImageStats.isFile().should.equal( true );
                currentImageStats.size.should.be.above( 0 );
            }

            // Make sure we went through the whole array
            i.should.equal( imageOptionsLength );
        });
    });

    describe( '.generate()', function() {
        it( 'should generate a new valid image option each time it\'s called', function() {
            var firstValue,
                secondValue;

            // Generate first values
            visualCaptcha.generate();

            firstValue = visualCaptcha.getValidImageOption().value;

            // Generate second values
            visualCaptcha.generate();

            secondValue = visualCaptcha.getValidImageOption().value;

            // Check both values don't match
            firstValue.should.not.equal( secondValue );
        });

        it( 'should generate a new valid audio option each time it\'s called', function() {
            var firstValue,
                secondValue;

            // Generate first values
            visualCaptcha.generate();

            firstValue = visualCaptcha.getValidAudioOption().value;

            // Generate second values
            visualCaptcha.generate();

            secondValue = visualCaptcha.getValidAudioOption().value;

            // Check both values don't match
            firstValue.should.not.equal( secondValue );
        });

        it( 'should generate new field names each time it\'s called', function() {
            var firstImageValue,
                secondImageValue,
                firstAudioValue,
                secondAudioValue;

            // Generate first values
            visualCaptcha.generate();

            firstImageValue = visualCaptcha.getFrontendData().imageFieldName;
            firstAudioValue = visualCaptcha.getFrontendData().audioFieldName;

            // Generate second values
            visualCaptcha.generate();

            secondImageValue = visualCaptcha.getFrontendData().imageFieldName;
            secondAudioValue = visualCaptcha.getFrontendData().audioFieldName;

            // Check both values don't match
            firstImageValue.should.not.equal( secondImageValue );
            firstAudioValue.should.not.equal( secondAudioValue );
        });

        it( 'should generate frontend data', function() {
            var frontendData;

            // Generate values
            visualCaptcha.generate();

            frontendData = visualCaptcha.getFrontendData();

            frontendData.should.have.property( 'values' );
            frontendData.should.have.property( 'imageName' );
            frontendData.should.have.property( 'imageFieldName' );
            frontendData.should.have.property( 'audioFieldName' );

            frontendData.values.should.be.instanceOf( Array );
            frontendData.imageName.length.should.be.above( 0 );
            frontendData.imageFieldName.length.should.be.above( 0 );
            frontendData.audioFieldName.length.should.be.above( 0 );
        });

        it( 'should generate new frontend data each time it\'s called', function() {
            var firstValue,
                secondValue;

            // Generate first values
            visualCaptcha.generate();

            firstValue = visualCaptcha.getFrontendData();

            // Generate second values
            visualCaptcha.generate();

            secondValue = visualCaptcha.getFrontendData();

            // Check both values don't match
            firstValue.should.not.equal( secondValue );
        });
    });

    describe( '.validateImage()', function() {
        it( 'should return true if the chosen image option is the valid one', function() {
            var optionValue;

            // Generate option values
            visualCaptcha.generate();

            optionValue = visualCaptcha.getValidImageOption().value;

            // Validate, sending the right optionValue, expecting a "true" to be returned
            visualCaptcha.validateImage( optionValue ).should.equal( true );
            
        });

        it( 'should return false if the chosen image option is not the valid one', function() {
            var optionValue = Math.random();// Will never match the optionValue

            // Generate option values
            visualCaptcha.generate();

            // Validate, sending the right optionValue, expecting a "false" to be returned
            visualCaptcha.validateImage( optionValue ).should.equal( false );
            
        });
    });

    describe( '.validateAudio()', function() {
        it( 'should return true if the chosen audio option is the valid one', function() {
            var optionValue;

            // Generate option values
            visualCaptcha.generate();

            optionValue = visualCaptcha.getValidAudioOption().value;

            // Validate, sending the right optionValue, expecting a "true" to be returned
            visualCaptcha.validateAudio( optionValue ).should.equal( true );
            
        });

        it( 'should return false if the chosen audio option is not the valid one', function() {
            var optionValue = Math.random();// Will never match the optionValue

            // Generate option values
            visualCaptcha.generate();

            // Validate, sending the right optionValue, expecting a "false" to be returned
            visualCaptcha.validateAudio( optionValue ).should.equal( false );
            
        });
    });

    describe( '.getImageOptions()', function() {
        it( 'should return a list with possible image options and the valid image option included', function() {
            var options,
                i,
                optionsLength,
                foundValidOptions = 0,
                validationResult,
                numberOfOptions = 4;

            // Generate option values ( 4 )
            visualCaptcha.generate( numberOfOptions );

            // Get the options list
            options = visualCaptcha.getImageOptions();

            optionsLength = options.length;

            optionsLength.should.equal( numberOfOptions );

            // Loop through all options, and count each time an image was successfully validated
            for ( i = 0; i < optionsLength; ++i ) {
                validationResult = visualCaptcha.validateImage( options[i].value );

                if ( validationResult ) {
                    ++foundValidOptions;
                }
            }

            // We should only find 1 valid option
            foundValidOptions.should.equal( 1 );
        });

        it( 'should return a list with all possible image options different', function() {
            var options,
                i,
                j,
                optionsLength,
                foundSimilarOptions = 0,
                numberOfOptions = 4;

            // Generate option values ( 4 )
            visualCaptcha.generate( numberOfOptions );

            // Get the options list
            options = visualCaptcha.getImageOptions();

            optionsLength = options.length;

            optionsLength.should.equal( numberOfOptions );

            // Loop through all options, and count each time a duplicate value exists in the array
            for ( i = 0; i < optionsLength; ++i ) {
                for ( j = 0; j < optionsLength; ++j ) {
                    if ( i !== j && options[i].value === options[j].value ) {
                        ++foundSimilarOptions;
                    }
                }
            }

            // We should find no equal options
            foundSimilarOptions.should.equal( 0 );
        });

        it( 'should return the same current image options list, if we don\'t generate a new valid value', function() {
            var firstOptions,
                secondOptions,
                thirdOptions,
                i,
                numberOfOptions = 4;

            // Generate option values ( 4 )
            visualCaptcha.generate( numberOfOptions );

            // Get the first options list
            firstOptions = visualCaptcha.getImageOptions();

            // Get the second options list
            secondOptions = visualCaptcha.getImageOptions();

            // Get the third options list
            thirdOptions = visualCaptcha.getImageOptions();

            // Loop through all options, and test each time that the same object exists in both the other arrays
            for ( i = 0; i < numberOfOptions; ++i ) {
                // Check if all the values match
                firstOptions[ i ].value.should.equal( secondOptions[i].value );
                firstOptions[ i ].value.should.equal( thirdOptions[i].value );
            }
        });
    });

    describe( '.getAudioOption()', function() {
        it( 'should return the current audio option, which should be the valid audio option', function() {
            var option;

            // Generate option values
            visualCaptcha.generate();

            // Get the option
            option = visualCaptcha.getAudioOption();

            // Check if the audio was successfully validated
            visualCaptcha.validateAudio( option.value ).should.equal( true );
        });

        it( 'should return the same audio option, if we don\'t generate a new valid value', function() {
            var firstOption,
                secondOption,
                thirdOption;

            // Generate option values
            visualCaptcha.generate();

            // Get the first option
            firstOption = visualCaptcha.getAudioOption();

            // Get the second option
            secondOption = visualCaptcha.getAudioOption();

            // Get the third option
            thirdOption = visualCaptcha.getAudioOption();

            // Check if all the values match
            firstOption.value.should.equal( secondOption.value );
            firstOption.value.should.equal( thirdOption.value );
        });
    });

    describe( '.streamImage()', function() {
        it( 'should find and stream an image file', function( done ) {
            var httpMock = require( './http-mock.js' ),
                response = httpMock.createResponse(),
                endCheck;

            // Generate option values
            visualCaptcha.generate();

            // Stream the image
            visualCaptcha.streamImage( 0, response );

            // Check if the image was successfully streamed
            endCheck = setInterval( function() {
                if ( response._isEndCalled ) {
                    clearInterval( endCheck );
                    done();
                }
            }, 10 );// Check every 10 milliseconds 
        });

        it( 'should find and stream a retina image file', function( done ) {
            var httpMock = require( './http-mock.js' ),
                response = httpMock.createResponse(),
                endCheck;

            // Generate option values
            visualCaptcha.generate();

            // Stream the retina image
            visualCaptcha.streamImage( 0, response, true );

            // Check if the image was successfully streamed
            endCheck = setInterval( function() {
                if ( response._isEndCalled ) {
                    clearInterval( endCheck );
                    done();
                }
            }, 10 );// Check every 10 milliseconds 
        });
    
        it( 'should fail to find an image file', function() {
            var httpMock = require( './http-mock.js' ),
                response = httpMock.createResponse();

            // Generate option values
            visualCaptcha.generate();

            // Stream the image (index 100, should never exist)
            visualCaptcha.streamImage( 100, response );

            // We should get a 404 status code
            response.statusCode.should.equal( 404 );
        });
    });

    describe( '.streamAudio()', function() {
        it( 'should find and stream an audio file - mp3', function( done ) {
            var httpMock = require( './http-mock.js' ),
                response = httpMock.createResponse(),
                endCheck;

            // Generate option values
            visualCaptcha.generate();

            // Stream the mp3 audio file
            visualCaptcha.streamAudio( response, 'mp3' );

            // Check if the audio file was successfully streamed
            endCheck = setInterval( function() {
                if ( response._isEndCalled ) {
                    clearInterval( endCheck );
                    done();
                }
            }, 10 );// Check every 10 milliseconds 
        });

        it( 'should find and stream an audio file - ogg', function( done ) {
            var httpMock = require( './http-mock.js' ),
                response = httpMock.createResponse(),
                endCheck;

            // Generate option values
            visualCaptcha.generate();

            // Stream the ogg audio file
            visualCaptcha.streamAudio( response, 'ogg' );

            // Check if the audio file was successfully streamed
            endCheck = setInterval( function() {
                if ( response._isEndCalled ) {
                    clearInterval( endCheck );
                    done();
                }
            }, 10 );// Check every 10 milliseconds 
        });
    
        it( 'should fail to find an audio file', function() {
            var httpMock = require( './http-mock.js' ),
                response = httpMock.createResponse();

            // Stream the audio file (we didn't generate options, so it should fail)
            visualCaptcha.streamAudio( response );

            // We should get a 404 status code
            response.statusCode.should.equal( 404 );
        });
    });

});