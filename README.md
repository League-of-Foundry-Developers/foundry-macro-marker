<h1 align="center">Macro Marker</h1>
<p align="center">
<img src="https://github.com/janssen-io/foundry-macro-marker/workflows/MacroMarker%20CI/badge.svg" alt="build status" /> <img src="https://img.shields.io/github/downloads-pre/janssen-io/foundry-macro-marker/v0.5.0/macro-marker.zip?label=v0.5.0" alt="v0.5.0 downloads" />
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

### Optional animated border
<p align="center">
<img src="./img/mm-animation.gif" width="500px" />
</p>

## Usage
You can toggle the state on one of three entities:

1. Macro
2. Token (or linked actor)
3. User

### Macro
Toggling the state on the macro will make it visible for every user, irregardless of the token they have selected.

```js
MacroMarker.toggle(macro);
```

### Token
Toggling the state on the token will make it visible for whoever controls the token. If the token is linked, the state will be synchronized across all other linked tokens of the same actor.

```js
let token = canvas.tokens.controlled[0];
MacroMarker.toggle(macro, { token: token });
```

### User
Toggling the state on the user will make it visible for only that user irregardless of the token they have selected.

```js
let user = game.user;
MacroMarker.toggle(macro, { user: user });
```

### Manual toggles
Alternatively, you can manually activate and deactivate it, using the same function signature as the `toggle`  function.

```js
MacroMarker.activate(macro);
MacroMarker.deactivate(macro);

MacroMarker.activate(macro, { user: user });
MacroMarker.deactivate(macro, { token: token });
```

### Using a custom colour
You can supply an alternative colour, by passing it in the data object of any of the above mentioned methods.
You can use any colour that is valid in [CSS](https://www.w3schools.com/cssref/css_colors_legal.asp).

```js
MacroMarker.toggle(macro, { token: token, colour: 'gold' });
MacroMarker.activate(macro, { user: user, colour: 'gold' });
MacroMarker.deactivate(macro, { colour: 'gold' });
```

### Checking the state
Finally, you can also check the state:

```js
MacroMarker.isActive(macro);
MacroMarker.isActive(macro, { token: token });
MacroMarker.isActive(macro, { user: user });
```
