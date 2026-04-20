const fs = require('fs');
const files = [
  'src/app/api/admin/settings/route.ts',
  'src/app/api/admin/settings/config/route.ts',
  'src/app/api/admin/microsoft/test/route.ts',
  'src/app/api/admin/microsoft/callback/route.ts',
  'src/app/api/admin/microsoft/auth/route.ts',
  'src/app/api/admin/google/test/route.ts',
  'src/app/api/admin/google/callback/route.ts',
  'src/app/api/admin/google/auth/route.ts'
];
files.forEach(f => {
  let text = fs.readFileSync(f, 'utf8');
  text = text.replace(/req: Request/g, 'req: NextRequest');
  if (text.includes("import { NextResponse } from 'next/server';")) {
     text = text.replace("import { NextResponse } from 'next/server';", "import { NextRequest, NextResponse } from 'next/server';");
  } else if (!text.includes("NextRequest")) {
     text = "import { NextRequest } from 'next/server';\n" + text;
  }
  fs.writeFileSync(f, text);
});
console.log('Done!');
