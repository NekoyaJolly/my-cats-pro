# Quick Reference - Code Quality & Security Checklist

**Purpose:** Daily development reference for maintaining code quality and security standards  
**Target Audience:** All developers on the MyCats Pro project

---

## 🔒 Security Checklist

### Before Every Commit

- [ ] No hardcoded secrets or API keys
- [ ] No console.log with sensitive data
- [ ] Environment variables properly used
- [ ] Input validation implemented (DTOs)
- [ ] SQL injection prevention (use Prisma, no raw SQL)
- [ ] XSS prevention (proper sanitization)

### Before Every PR

- [ ] Authentication/Authorization checks in place
- [ ] Rate limiting considered for endpoints
- [ ] Error messages don't leak sensitive info
- [ ] CORS configuration reviewed
- [ ] Dependencies up to date (`pnpm audit`)
- [ ] No new high/critical vulnerabilities

### API Development

```typescript
// ✅ DO: Validate input with DTOs
@Post()
async create(@Body() dto: CreateCatDto) {
  return this.service.create(dto);
}

// ❌ DON'T: Accept any object
@Post()
async create(@Body() data: any) {
  return this.service.create(data);
}

// ✅ DO: Use guards for authentication
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile() { }

// ❌ DON'T: Skip authentication
@Get('profile')
async getProfile() { }
```

---

## 🎨 Frontend Best Practices

### Component Development

```tsx
// ✅ DO: Type-safe props
interface CatCardProps {
  cat: Cat;
  onEdit: (cat: Cat) => void;
  onDelete: (cat: Cat) => void;
}

export function CatCard({ cat, onEdit, onDelete }: CatCardProps) {
  // ...
}

// ❌ DON'T: Use any type
export function CatCard({ cat, onEdit, onDelete }: any) {
  // ...
}

// ✅ DO: Accessible buttons
<button aria-label={`${cat.name}を編集`} onClick={() => onEdit(cat)}>
  <IconEdit />
</button>

// ❌ DON'T: Non-semantic elements
<div onClick={() => onEdit(cat)}>
  <IconEdit />
</div>
```

### Form Validation

```tsx
// ✅ DO: Use Zod + React Hook Form
const schema = z.object({
  name: z.string().min(1, '名前は必須です'),
  birthDate: z.date(),
});

const form = useForm({
  resolver: zodResolver(schema),
});

// ❌ DON'T: Manual validation
const [errors, setErrors] = useState({});
const validate = () => {
  if (!name) setErrors({ name: '必須' });
};
```

### State Management

```tsx
// ✅ DO: Use appropriate hooks
const { data, isLoading, error } = useQuery({
  queryKey: ['cats'],
  queryFn: fetchCats,
});

// ❌ DON'T: Manual state for async data
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
useEffect(() => {
  setLoading(true);
  fetch('/cats').then(setData).finally(() => setLoading(false));
}, []);
```

---

## 🗄️ Database Best Practices

### Query Optimization

```typescript
// ✅ DO: Include relations in single query
const cats = await prisma.cat.findMany({
  include: {
    breed: true,
    coatColor: true,
  },
});

// ❌ DON'T: N+1 queries
const cats = await prisma.cat.findMany();
for (const cat of cats) {
  cat.breed = await prisma.breed.findUnique({ where: { id: cat.breedId } });
}

// ✅ DO: Select only needed fields
const cats = await prisma.cat.findMany({
  select: {
    id: true,
    name: true,
    breed: { select: { name: true } },
  },
});

// ❌ DON'T: Select everything
const cats = await prisma.cat.findMany({
  include: { /* everything */ },
});
```

### Schema Design

```prisma
// ✅ DO: Add indexes for frequently queried fields
model Cat {
  name String
  birthDate DateTime
  
  @@index([name])
  @@index([birthDate])
}

// ✅ DO: Use proper foreign key constraints
model CareRecord {
  catId String
  cat   Cat    @relation(fields: [catId], references: [id], onDelete: Cascade)
}

// ❌ DON'T: Missing constraints
model CareRecord {
  catId String
  cat   Cat    @relation(fields: [catId], references: [id])
}
```

---

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// ✅ DO: Test business logic
describe('CatService', () => {
  it('should create cat with valid data', async () => {
    const result = await service.create(validData);
    expect(result).toBeDefined();
    expect(result.name).toBe(validData.name);
  });
  
  it('should throw error with invalid breed', async () => {
    await expect(service.create(invalidData)).rejects.toThrow();
  });
});

// ❌ DON'T: Skip error cases
describe('CatService', () => {
  it('should create cat', async () => {
    const result = await service.create(validData);
    expect(result).toBeDefined();
  });
  // Missing error case tests
});
```

### Component Tests

```tsx
// ✅ DO: Test user interactions
it('should submit form with valid data', async () => {
  render(<CatForm onSubmit={mockSubmit} />);
  
  await userEvent.type(screen.getByLabelText('名前'), 'Fluffy');
  await userEvent.click(screen.getByRole('button', { name: '登録' }));
  
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'Fluffy',
      // ...
    });
  });
});

// ❌ DON'T: Only test rendering
it('should render form', () => {
  render(<CatForm />);
  expect(screen.getByLabelText('名前')).toBeInTheDocument();
});
```

---

## 📝 Code Style

### Naming Conventions

```typescript
// ✅ DO: Clear, descriptive names
async function findCatsByBreedAndOwner(breedId: string, ownerId: string) {
  return prisma.cat.findMany({
    where: { breedId, ownerId },
  });
}

// ❌ DON'T: Abbreviations or unclear names
async function findCBO(b: string, o: string) {
  return prisma.cat.findMany({ where: { breedId: b, ownerId: o } });
}

// ✅ DO: Consistent naming patterns
// Services: CatsService, BreedsService
// Controllers: CatsController, BreedsController
// DTOs: CreateCatDto, UpdateCatDto

// ❌ DON'T: Inconsistent naming
// catService, BreedService
// cats.controller, BreedController
// CatCreateDto, updateCatDto
```

### File Organization

```
✅ DO: Group by feature
src/
  cats/
    cats.controller.ts
    cats.service.ts
    cats.module.ts
    dto/
      create-cat.dto.ts
      update-cat.dto.ts
    entities/
      cat.entity.ts

❌ DON'T: Group by type
src/
  controllers/
    cats.controller.ts
    breeds.controller.ts
  services/
    cats.service.ts
    breeds.service.ts
```

---

## 🚀 Performance Tips

### Backend

```typescript
// ✅ DO: Use pagination
async findAll(query: PaginationDto) {
  return prisma.cat.findMany({
    take: query.limit || 20,
    skip: (query.page - 1) * (query.limit || 20),
  });
}

// ❌ DON'T: Return all records
async findAll() {
  return prisma.cat.findMany(); // Could be thousands!
}

// ✅ DO: Batch operations
await prisma.$transaction([
  prisma.cat.create({ data: cat1 }),
  prisma.cat.create({ data: cat2 }),
]);

// ❌ DON'T: Sequential operations
await prisma.cat.create({ data: cat1 });
await prisma.cat.create({ data: cat2 });
```

### Frontend

```tsx
// ✅ DO: Memoize expensive calculations
const sortedCats = useMemo(
  () => cats.sort((a, b) => a.name.localeCompare(b.name)),
  [cats]
);

// ❌ DON'T: Recalculate on every render
const sortedCats = cats.sort((a, b) => a.name.localeCompare(b.name));

// ✅ DO: Use Next.js Image component
import Image from 'next/image';
<Image src="/cat.jpg" width={400} height={300} alt="Cat" />

// ❌ DON'T: Use regular img tag
<img src="/cat.jpg" alt="Cat" />
```

---

## 🔍 Code Review Checklist

### Before Requesting Review

- [ ] Code follows project style guide
- [ ] All tests pass locally
- [ ] No console.log or debug code
- [ ] ESLint warnings addressed
- [ ] TypeScript errors resolved
- [ ] Meaningful commit messages
- [ ] PR description explains changes

### Reviewing Others' Code

- [ ] Code is readable and maintainable
- [ ] Security concerns addressed
- [ ] Performance implications considered
- [ ] Tests cover main scenarios
- [ ] Documentation updated if needed
- [ ] No breaking changes without migration plan

---

## ⚡ Quick Commands

### Development

```bash
# Start development servers
pnpm run dev

# Run tests
pnpm run test                 # Unit tests
pnpm run test:e2e            # E2E tests
pnpm run test:cov            # Coverage report

# Lint and format
pnpm run lint                 # Run ESLint
pnpm run type-check          # TypeScript check

# Database
pnpm run db:migrate          # Run migrations
pnpm run db:generate         # Generate Prisma client
pnpm run db:studio           # Open Prisma Studio
pnpm run db:seed             # Seed database
```

### Troubleshooting

```bash
# Port conflicts
pnpm run predev              # Kill ports 3000, 3004

# Database issues
pnpm run db:generate         # Regenerate Prisma client
pnpm run db:migrate          # Apply migrations

# Dependency issues
rm -rf node_modules pnpm-lock.yaml
pnpm install                 # Fresh install
```

---

## 📚 Additional Resources

- **Full Review:** `docs/CODEBASE_REVIEW_REPORT.md`
- **Action Plan:** `docs/IMPROVEMENT_ACTION_PLAN.md`
- **Executive Summary:** `docs/EXECUTIVE_SUMMARY_JP.md`
- **Main README:** `README.md`

---

## 🎯 Priority Focus Areas

### This Week
1. ✅ Implement CSRF protection
2. ✅ Secure environment variables
3. ✅ Add rate limiting to auth endpoints

### This Month
1. Optimize database indexes
2. Improve frontend type safety
3. Increase test coverage

### This Quarter
1. Achieve 70% test coverage
2. Implement accessibility improvements
3. Optimize performance

---

**Last Updated:** 2025-11-11  
**Version:** 1.0  
**Maintained by:** Development Team
