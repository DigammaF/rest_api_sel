import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 API Server Started`);
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🔗 API Routes: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log(`\n✓ Ready to accept requests\n`);
});
