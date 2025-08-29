# Rydex Motors Ltd

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure EmailJS (for the Contact form):

- Create a `.env` file in the project root with:

```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

- In EmailJS, ensure your template fields include `user_name`, `user_email`, and `message`.

3. Start the dev server:

```bash
npm run dev
```

## Notes

- Featured vehicles and images are demo data in `src/data/vehicles.js`.
- Contact page map uses a Google Maps embed placeholder centered on Nairobi; replace the `src` with your map embed URL as needed.
