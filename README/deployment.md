# Deployment Guide

This project is optimized for **Vercel Serverless Functions**.

## Prerequisites

- [Vercel Account](https://vercel.com)
- [Vercel CLI](https://vercel.com/docs/cli) instalado: `npm i -g vercel`

## Deployment Steps

1. **Initialize Vercel**:
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

2. **Configure Environment Variables**:
   In your Vercel Project Dashboard, go to **Settings > Environment Variables** and add all keys listed in [Environment Variables](environment-variables.md).

3. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Production Considerations

- Ensure `ALLOWED_ORIGIN` is set to your production frontend URL to maintain proper security.
- Monitor Vercel logs for any persistent `429` or `500` errors.
