# Preview Images Directory

This directory contains preview images for different referral codes.

## How It Works

When someone shares a link with a `ref` parameter (e.g., `?ref=BNPU07`), the middleware will automatically update the Open Graph and Twitter Card meta tags to show a custom preview image.

## Adding Preview Images

1. Create preview images (recommended size: 1200x630px, PNG format)
2. Name them according to the ref code in `functions/_middleware.ts`
3. Place them in this directory

## Example

- `builder.png` - For ref code `BNPU07` (THE BUILDER)
- `degen.png` - For ref code `S6Z7UL` (THE DEGEN)

## Adding New Ref Codes

Edit `functions/_middleware.ts` and add a new entry to the `REF_CONFIGS` object:

```typescript
'YOUR_REF_CODE': {
  title: 'Your Title - Solana Wrapped 2025',
  description: 'Your description here',
  image: '/previews/your-image.png',
  type: 'YOUR TYPE'
}
```

