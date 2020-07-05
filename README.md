<h1 align="center">Macro Marker</h1>
<p align="center">
<img src="https://github.com/janssen-io/foundry-macro-marker/workflows/MacroMarker%20CI/badge.svg" alt="build status" /> <img src="https://img.shields.io/github/downloads-pre/janssen-io/foundry-macro-marker/v0.4.1/macro-marker.zip?label=v0.4.1" alt="v0.4.1 downloads" />
</p>

Using this Foundry VTT module, you can mark macros as active giving them a coloured border and an alternative icon.

Dimming the inactive macros is configurable in the module settings.

### Coloured active macros
<p align="center">
<img src="./img/mm-dim.png" width="500px" />
</p>

---

### Alternative icon and tooltip
<p align="center">
<img src="./img/mm-config.png" width="500px" />
</p>
<p align="center">
<img src="./img/mm-tooltip.gif" width="500px" />
</p>

---

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
// Use either this one:
MacroMarker.toggleTokenMacro(this, token, '#f37e44');

// or:
MacroMarker.toggleUserMacro(this, game.user); // default colour can be configured in settings

// or:
MacroMarker.toggleMacro(this, 'rgb(255, 243, 88)'); // any CSS colour is valid
```
