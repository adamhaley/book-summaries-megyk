 curl -X POST https://n8n.megyk.com/webhook/get_book_summary \
    -H "Content-Type: application/json" \
    -d '{
      "book_id": "bf866d4e-fc6f-4c2f-81b8-db1794c2285b",
      "preferences": {
        "style": "narrative",
        "length": "5pg"
      }
    }'
