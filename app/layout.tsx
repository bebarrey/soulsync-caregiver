export const metadata = {
  title: "SOULsync",
  description: "Daily check-ins and calm plans for caregivers."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#fff' }}>{children}</body>
    </html>
  );
}
