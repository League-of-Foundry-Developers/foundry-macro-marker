### Changes
- Prevent stack overflows when accidentally passing the entity itself instead of a colour.
- Bind active state to actor in case of linked tokens.
- Give precedence to markers on the macro itself, then on the user and finally on the token/linked actor.  
  The idea is that mistakes are easier to fix when made on the macro or user.
- Added MacroMarker.clearMarkers(macroId) for clearing existing markers on macros and users.


---

### Known issues
The examples won't work with The Furnace. `this` no longer references the macro itself when using that module.  
*The maintainer is aware of the issue and a fix is underway.*