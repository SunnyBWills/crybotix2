# Crybotix2

The application exposes an unauthenticated API endpoint at `/api/ui/push`.
Any client can POST trade data to this route so the UI can be kept up to date.

```json
{
  "symbol": "BTC/USDT",
  "long_entry": "50000",
  "long_tp": "52000",
  "long_sl": "49000",
  "long_volume": "1",
  "short_entry": "50000",
  "short_tp": "48000",
  "short_sl": "51000",
  "short_volume": "1"
}
```

The most recent trade data can be retrieved with `GET /api/ui/push` and is polled by the UI to populate the form automatically.
