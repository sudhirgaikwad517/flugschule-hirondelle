const fs = require('fs');

let code = fs.readFileSync('src/admin/EventsDashboard.tsx', 'utf8');

code = code.replace(/<Grid item xs=\{12\} md=\{4\}>/g, '<Grid size={{ xs: 12, md: 4 }}>');
code = code.replace(/<Grid item xs=\{12\} md=\{8\}>/g, '<Grid size={{ xs: 12, md: 8 }}>');
code = code.replace(/<Grid item xs=\{12\} sm=\{6\} md=\{3\}>/g, '<Grid size={{ xs: 12, sm: 6, md: 3 }}>');
code = code.replace(/<Grid item xs=\{12\} sm=\{6\}>/g, '<Grid size={{ xs: 12, sm: 6 }}>');
code = code.replace(/<Grid item xs=\{12\}>/g, '<Grid size={{ xs: 12 }}>');
code = code.replace(/<Grid item xs=\{6\}>/g, '<Grid size={{ xs: 6 }}>');

fs.writeFileSync('src/admin/EventsDashboard.tsx', code);

console.log('Fixed EventsDashboard.tsx');
