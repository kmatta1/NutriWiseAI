export default function HomePage() {
  return (
    <div style={{ padding: '40px', background: 'white', color: 'black', minHeight: '100vh' }}>
      <h1>NutriWise AI - Debug Version</h1>
      <p>This is a simplified version of the home page to test if the basic page structure works.</p>
      <p>If you can see this, Next.js is working. The issue is in the complex components.</p>
      <nav style={{ marginTop: '20px' }}>
        <a href="/advisor" style={{ marginRight: '20px', color: 'blue' }}>Go to Advisor</a>
        <a href="/test" style={{ color: 'blue' }}>Go to Test Page</a>
      </nav>
    </div>
  );
}
