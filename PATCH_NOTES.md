**Deprecations:**
Macro Hotbar will now show a warning when the following functions are used:

- MacroMarker.toggleMacro
- MacroMarker.toggleUserMacro
- MacroMarker.toggleTokenMacro

- MacroMarker.toggle(macro, { token })
- MacroMarker.toggle(macro, { user })
- MacroMarker.activate(macro, { token })
- MacroMarker.deactivate(macro, { user })

instead the following function (signatures) should be used:

- MacroMarker.toggle(macro, { entity })
- MacroMarker.activate(macro, { entity })
- MacroMarker.deactivate(macro, { entity })

**Breaking changes:**
The following functionality has been changed immediately.
- Marker colour is no longer part of the individual markers, but instead part of the macro configuration and stored in 'macro-marker.activeData'

Despite being part of the inner workings, the following features are listed here just in case you do depend on them.
However, I strongly discourage using them, because they might change again in a next stable version.

- Markers are no longer stored in the user, token or actor flags. Instead they are stored in the macro under 'macro-marker.markers'.
- Because markers are now stored only on the macro. The flag has the following structure:
```js
{
    type: 'Token'|'Actor'|'User'|'Macro',
    [entityId]: boolean | undefined
}
```

**New features:**
- Add condition-based toggling. This condition is checked on sheet updates, selecting tokens and when the hotbar renders.
- Move active tooltip and active icon to separate tab

**Fixed bugs:**
- Marker does not show when both players are looking at the same marker when it is (de)activated.
