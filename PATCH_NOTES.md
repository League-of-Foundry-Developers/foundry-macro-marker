**Fix hotbar override**

Extending the hotbar class lead to broken hooks (render instead of
renderHotbar). It's safer to monkey patch the hover callback.

The same needs to be done for Custom Hotbar, if present.
