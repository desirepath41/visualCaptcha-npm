[![Build Status](https://travis-ci.org/emotionLoop/visualCaptcha-npm.svg?flat=true&branch=master)](https://travis-ci.org/emotionLoop/visualCaptcha-npm)
[![Coverage Status](https://coveralls.io/repos/emotionLoop/visualCaptcha-npm/badge.svg?flat=true)](https://coveralls.io/r/emotionLoop/visualCaptcha-npm)
[![Codacy](https://www.codacy.com/project/badge/23de488143aa480d8fb8482dd4acca4d)](https://www.codacy.com/app/bruno-bernardino/visualCaptcha-npm)
[![Code Climate](https://codeclimate.com/github/emotionLoop/visualCaptcha-npm/badges/gpa.svg)](https://codeclimate.com/github/emotionLoop/visualCaptcha-npm)

# visualCaptcha-npm

Node.js NPM package for visualCaptcha's backend service


## Installation with NPM

You need Node.js installed with npm.
```
npm install visualcaptcha
```


## Run tests

Run next command to start mocha unit tests:
```
npm test
```


## Usage

### Initialization

On initialization visualCaptcha function requires `req.session` session object as first argument:

```
visualCaptcha = require( 'visualcaptcha' )( req.session, defaultImages, defaultAudios );
```
Where:

- `defaultImages` is optional parameter. Defaults to the array inside ./images.json. The path is relative to ./images/
- `defaultAudios` is optional parameter. Defaults to the array inside ./audios.json. The path is relative to ./audios/

### visualCaptcha properties

- `session`, JSON object — Object that will have a reference for the session object.
It will have .visualCaptcha.images, .visualCaptcha.audios, .visualCaptcha.validImageOption, and .visualCaptcha.validAudioOption.

- `imageOptions`, array — All the image options.
These can be easily overwritten or extended using addImageOptions( <Array> ), or replaceImageOptions( <Array> ).
By default, they're populated using the ./images.json file.

- `audioOptions`, array — All the audio options.
These can be easily overwritten or extended using addImageOptions( <Array> ), or replaceImageOptions( <Array> ).
By default, they're populated using the ./audios.json file.

### visualCaptcha methods

- `generate: function( numberOfOptions )` — Generate a new valid visualCaptcha front-end data. `numberOfOptions` — is optional parameter for number of generated images, defaults to `5`.
- `getFrontendData: function()` — Get data to be used by the frontend.
- `getFrontendData: function()` — Get data to be used by the frontend.
- `getValidImageOption: function()` — Get the current validImageOption.
- `getValidAudioOption: function()` — Get the current validAudioOption.
- `validateImage: function( sentOption )` — Validate the sent image value with the validImageOption.
- `validateAudio: function( sentOption )` — Validate the sent audio value with the validAudioOption.
- `getImageOptions: function()` — Return generated image options.
- `getImageOptionAtIndex: function(index)` — Return generated image option at index.
- `getAudioOption: function() ` — Alias for getValidAudioOption.
- `getAllImageOptions: function()` — Return all the image options.
- `getAllAudioOptions: function()` — Return all the audio options.
- `getAudio: function( response, fileType )` — Loads a file in the session visualCaptcha audio. Parameters:
    - `response` is Node's response object,
    - `fileType` is audio filetype, defaults to `'mp3'`, can also be `'ogg'`.
- `streamAudio: function( response, fileType )` — Stream audio file. Parameters:
    - `response` is Node's response object;
    - `fileType` is audio filetype, defaults to `'mp3'`, can also be `'ogg'`.
- `getImage: function( index,  response, isRetina )` — Loads a file given an index in the session visualCaptcha images array. Parameters:
    - `index` is index of the image in the session images array to send;
    - `response` is Node's response object;
    - `isRetina`, boolean, defaults to `false`.
- `streamImage: function( index, response, isRetina )` — Stream image file given an index in the session visualCaptcha images array. Parameters:
    - `index` is index of the image in the session images array to send;
    - `response` is Node's response object;
    - `isRetina`, boolean, defaults to `false`.


## License
View the [LICENSE](LICENSE) file.