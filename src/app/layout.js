import './globals.css'
export const metadata = {
  title: 'SportSnap AI',
  description: 'AI-generated sports celebrity history reels',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}