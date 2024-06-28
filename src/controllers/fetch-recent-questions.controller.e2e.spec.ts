import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'

// TODO: Terminar!

describe('Fetch recent questions (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.question.deleteMany()
    await prisma.user.deleteMany()
  })

  test('[GET] /questions', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: `johndoe@example.com`,
        password: await hash('12345678', 8),
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    await prisma.question.createMany({
      data: [
        {
          title: 'Title Example 1',
          content: 'Content Example 1',
          slug: 'title-example-1',
          authorId: user.id,
        },
        {
          title: 'Title Example 2',
          content: 'Content Example 2',
          slug: 'title-example-2',
          authorId: user.id,
        },
      ],
    })

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.questions).toHaveLength(2)
    expect(response.body).toEqual({
      questions: [
        {
          id: expect.any(String),
          title: 'Title Example 1',
          content: 'Content Example 1',
          slug: 'title-example-1',
          authorId: user.id,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
        expect.objectContaining({ title: 'Title Example 2' }),
      ],
    })
  })
})
