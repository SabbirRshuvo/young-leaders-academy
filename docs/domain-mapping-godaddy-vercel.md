# GoDaddy Domain Mapping & Vercel Deployment Configuration

This guide provides the complete, step-by-step instructions for mapping a custom domain purchased on **GoDaddy** to the **Next.js** application hosted on **Vercel**, including Supabase Auth Redirect URL configuration for password resets and social auth.

---

## 1. Vercel Project Configuration

### Step 1: Add Custom Domain in Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Select the **young-leaders-academy** project.
3. Navigate to **Settings** > **Domains**.
4. Enter your custom domain (e.g., `youngleadersacademy.org` or your client's registered domain).
5. Click **Add**.
6. Vercel will recommend adding both:
   - Apex domain: `yourdomain.com`
   - Subdomain: `www.yourdomain.com` (configured to redirect to apex, or vice versa based on client preference).

---

## 2. GoDaddy DNS Management Setup

1. Log in to [GoDaddy Account Manager](https://account.godaddy.com/).
2. Under **My Products**, locate your domain and click **DNS** (or **Manage DNS**).
3. Under the **DNS Records** tab, add or edit the following records:

### Recommended A & CNAME Records (Vercel Direct IP)

| Type | Name / Host | Value / Destination | TTL | Description |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` | `600` (or 1/2 hour) | Points root domain to Vercel global edge network |
| **CNAME** | `www` | `cname.vercel-dns.com` | `600` (or 1/2 hour) | Points www subdomain to Vercel DNS alias |

> **Note on Existing Records:**
> If GoDaddy has a default "Parked" A record for `@` or a forwarding rule, delete or update the existing `@` A record so it only points to `76.76.21.21`.

### Alternative: Delegating Nameservers to Vercel (Optional)
If you prefer Vercel to manage all DNS automatically:
- Nameserver 1: `ns1.vercel-dns.com`
- Nameserver 2: `ns2.vercel-dns.com`

---

## 3. SSL / HTTPS Certificate Verification

1. Once the DNS records are saved in GoDaddy, return to your **Vercel Domains** panel.
2. Vercel will automatically verify DNS propagation (typically 2 to 15 minutes, maximum 24 hours).
3. As soon as verification succeeds, Vercel provisions a free, auto-renewing **Let's Encrypt SSL/TLS Certificate**.
4. A green checkmark with `Valid Configuration` will appear next to both `yourdomain.com` and `www.yourdomain.com`.

---

## 4. Next.js Environment Variables in Vercel

In the Vercel project settings (**Settings** > **Environment Variables**), ensure the following variables are configured for **Production**, **Preview**, and **Development**:

```ini
# Site URL (Used for Password Reset & Dynamic Canonical Links)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Supabase Public Keys
NEXT_PUBLIC_SUPABASE_URL=https://mrbwdrwqfskfvkgirrkf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (Server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 5. Supabase Auth Redirect URLs Configuration (CRITICAL FOR PASSWORD RESET)

To ensure the password recovery and login flows work smoothly with your GoDaddy domain:

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project (`mrbwdrwqfskfvkgirrkf`).
3. In the left sidebar, navigate to **Authentication** > **URL Configuration**.
4. Set **Site URL**:
   ```
   https://yourdomain.com
   ```
5. In **Redirect URLs**, click **Add URL** and add the following entries:
   ```
   https://yourdomain.com/**
   https://yourdomain.com/auth/callback
   https://yourdomain.com/api/auth/callback
   https://yourdomain.com/reset-password
   https://yourdomain.com/en/reset-password
   https://yourdomain.com/ar/reset-password
   https://www.yourdomain.com/**
   http://localhost:3000/**
   ```
6. Click **Save Changes**.

---

## 6. Verification Checklist

- [ ] Typing `http://yourdomain.com` redirects automatically to `https://yourdomain.com`.
- [ ] Typing `https://www.yourdomain.com` redirects smoothly to canonical domain.
- [ ] Visiting `/forgot-password` and submitting email sends recovery email with correct domain link.
- [ ] Clicking the link in the password reset email lands on `https://yourdomain.com/en/reset-password` or `https://yourdomain.com/ar/reset-password` without any 404 or redirect mismatch error.
