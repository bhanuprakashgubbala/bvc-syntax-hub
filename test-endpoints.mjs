async function testEndpoints() {
  const urls = [
    'http://localhost:3000/login',
    'http://localhost:3000/api/hod/allocations',
    'http://localhost:3000/api/faculty/tasks',
    'http://localhost:3000/api/student/tasks',
    'http://localhost:3000/hod',
    'http://localhost:3000/hod/allocations',
    'http://localhost:3000/hod/sections',
    'http://localhost:3000/hod/submissions',
    'http://localhost:3000/faculty',
    'http://localhost:3000/faculty/allocations',
    'http://localhost:3000/faculty/tasks',
    'http://localhost:3000/faculty/observations',
    'http://localhost:3000/user/tasks',
    'http://localhost:3000/user/codearena'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(`[${res.status === 200 ? 'PASS' : 'WARN'}] ${res.status} - ${url}`);
    } catch (err) {
      console.log(`[FAIL] Error for ${url}:`, err.message);
    }
  }
}

testEndpoints();
