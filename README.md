<h1 align="center">Macro Marker</h1>
<p align="center">
<img src="https://github.com/janssen-io/foundry-macro-marker/workflows/MacroMarker%20CI/badge.svg" alt="build status" /> <img src="https://img.shields.io/github/downloads-pre/janssen-io/foundry-macro-marker/v0.2.0/macro-marker.zip?label=v0.2.0" alt="v0.2.0 downloads" />
</p>

Using this Foundry VTT module, you can mark macros as active giving them a coloured border.

Dimming the inactive macros is configurable in the module settings.

<p align="center">
<img src="./img/mm-dim.png" />
</p>

## Usage
You can toggle the state on three levels:

```js
// Toggle only for the selected token
MacroMarker.toggleTokenMacro(macro, token, colour);

// Toggle only for the given user
MacroMarker.toggleUserMacro(macro, user, colour);  

// Toggle for the specific macro (for every user, independent of the selected token)
MacroMarker.toggleMacro(macro, colour);
```` 

Example usage inside a macro:
```js
MacroMarker.toggleTokenMacro(this, token, '#f37e44');
MacroMarker.toggleUserMacro(this, game.user); // default colour can be configured in settings
MacroMarker.toggleMacro(this, token, 'rgb(255, 243, 88)'); // any CSS colour is valid
```
