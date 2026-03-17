import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Prisma, PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

const WARMUP_RUNS = 3;
const MEASURED_RUNS = 12;
const DEFAULT_LIMIT = 12;
const DEFAULT_SKIP = 0;

type ScenarioResult = {
  name: string;
  runs: number;
  warmups: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  minMs: number;
  maxMs: number;
  sampleRows: number;
  sampleTotal: number;
};

type Scenario = {
  name: string;
  execute: () => Promise<{ rows: number; total: number }>;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

function getOrderBy(sortBy: 'newest' | 'price-low' | 'price-high' | 'size-small' | 'size-large'): Prisma.ListingOrderByWithRelationInput[] {
  switch (sortBy) {
    case 'price-low':
      return [{ price: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }];
    case 'price-high':
      return [{ price: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }];
    case 'size-small':
      return [{ size: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }];
    case 'size-large':
      return [{ size: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }];
    case 'newest':
    default:
      return [{ createdAt: 'desc' }];
  }
}

async function runScenario(scenario: Scenario): Promise<ScenarioResult> {
  for (let i = 0; i < WARMUP_RUNS; i++) {
    await scenario.execute();
  }

  const durations: number[] = [];
  let sampleRows = 0;
  let sampleTotal = 0;

  for (let i = 0; i < MEASURED_RUNS; i++) {
    const start = process.hrtime.bigint();
    const result = await scenario.execute();
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    durations.push(durationMs);
    sampleRows = result.rows;
    sampleTotal = result.total;
  }

  const sum = durations.reduce((acc, v) => acc + v, 0);
  return {
    name: scenario.name,
    runs: MEASURED_RUNS,
    warmups: WARMUP_RUNS,
    avgMs: round2(sum / durations.length),
    p50Ms: round2(percentile(durations, 50)),
    p95Ms: round2(percentile(durations, 95)),
    minMs: round2(Math.min(...durations)),
    maxMs: round2(Math.max(...durations)),
    sampleRows,
    sampleTotal,
  };
}

async function buildScenarios(): Promise<Scenario[]> {
  const scenarios: Scenario[] = [];

  scenarios.push({
    name: 'public-default-newest',
    execute: async () => {
      const where: Prisma.ListingWhereInput = { isPublished: true };
      const [rows, total] = await Promise.all([
        prisma.listing.findMany({
          where,
          orderBy: getOrderBy('newest'),
          take: DEFAULT_LIMIT,
          skip: DEFAULT_SKIP,
          select: { id: true },
        }),
        prisma.listing.count({ where }),
      ]);
      return { rows: rows.length, total };
    },
  });

  scenarios.push({
    name: 'public-listingType-sale-newest',
    execute: async () => {
      const where: Prisma.ListingWhereInput = { isPublished: true, listingType: 'sale' };
      const [rows, total] = await Promise.all([
        prisma.listing.findMany({
          where,
          orderBy: getOrderBy('newest'),
          take: DEFAULT_LIMIT,
          skip: DEFAULT_SKIP,
          select: { id: true },
        }),
        prisma.listing.count({ where }),
      ]);
      return { rows: rows.length, total };
    },
  });

  scenarios.push({
    name: 'public-propertyType-condominium-newest',
    execute: async () => {
      const where: Prisma.ListingWhereInput = { isPublished: true, propertyType: 'condominium' };
      const [rows, total] = await Promise.all([
        prisma.listing.findMany({
          where,
          orderBy: getOrderBy('newest'),
          take: DEFAULT_LIMIT,
          skip: DEFAULT_SKIP,
          select: { id: true },
        }),
        prisma.listing.count({ where }),
      ]);
      return { rows: rows.length, total };
    },
  });

  scenarios.push({
    name: 'public-price-range-sort-price-low',
    execute: async () => {
      const where: Prisma.ListingWhereInput = { isPublished: true, price: { gte: 5000000, lte: 25000000 } };
      const [rows, total] = await Promise.all([
        prisma.listing.findMany({
          where,
          orderBy: getOrderBy('price-low'),
          take: DEFAULT_LIMIT,
          skip: DEFAULT_SKIP,
          select: { id: true },
        }),
        prisma.listing.count({ where }),
      ]);
      return { rows: rows.length, total };
    },
  });

  scenarios.push({
    name: 'public-size-range-sort-size-large',
    execute: async () => {
      const where: Prisma.ListingWhereInput = { isPublished: true, size: { gte: 80, lte: 450 } };
      const [rows, total] = await Promise.all([
        prisma.listing.findMany({
          where,
          orderBy: getOrderBy('size-large'),
          take: DEFAULT_LIMIT,
          skip: DEFAULT_SKIP,
          select: { id: true },
        }),
        prisma.listing.count({ where }),
      ]);
      return { rows: rows.length, total };
    },
  });

  scenarios.push({
    name: 'public-location-contains',
    execute: async () => {
      const where: Prisma.ListingWhereInput = {
        isPublished: true,
        OR: [
          { city: { contains: 'Manila', mode: 'insensitive' } },
          { location: { contains: 'Manila', mode: 'insensitive' } },
        ],
      };
      const [rows, total] = await Promise.all([
        prisma.listing.findMany({
          where,
          orderBy: getOrderBy('newest'),
          take: DEFAULT_LIMIT,
          skip: DEFAULT_SKIP,
          select: { id: true },
        }),
        prisma.listing.count({ where }),
      ]);
      return { rows: rows.length, total };
    },
  });

  const sampleOwner = await prisma.listing.findFirst({
    select: { userId: true },
  });

  if (sampleOwner?.userId) {
    scenarios.push({
      name: 'nonpublic-auth-equivalent',
      execute: async () => {
        const where: Prisma.ListingWhereInput = {
          OR: [{ isPublished: true }, { userId: sampleOwner.userId }],
        };
        const [rows, total] = await Promise.all([
          prisma.listing.findMany({
            where,
            orderBy: getOrderBy('newest'),
            take: DEFAULT_LIMIT,
            skip: DEFAULT_SKIP,
            select: { id: true },
          }),
          prisma.listing.count({ where }),
        ]);
        return { rows: rows.length, total };
      },
    });
  }

  return scenarios;
}

async function main() {
  const stage = process.argv[2] === 'after' ? 'after' : 'before';
  const startedAt = new Date().toISOString();
  const scenarios = await buildScenarios();

  const results: ScenarioResult[] = [];
  for (const scenario of scenarios) {
    const result = await runScenario(scenario);
    results.push(result);
    console.log(
      `${scenario.name}: avg=${result.avgMs}ms p50=${result.p50Ms}ms p95=${result.p95Ms}ms min=${result.minMs}ms max=${result.maxMs}ms`
    );
  }

  const output = {
    stage,
    startedAt,
    finishedAt: new Date().toISOString(),
    warmupRuns: WARMUP_RUNS,
    measuredRuns: MEASURED_RUNS,
    scenarios: results,
  };

  const reportsDir = path.join(process.cwd(), 'scripts', 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const outputPath = path.join(reportsDir, `listings-phase4-benchmark-${stage}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Benchmark report written to ${outputPath}`);
}

main()
  .catch((error) => {
    console.error('Benchmark failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
