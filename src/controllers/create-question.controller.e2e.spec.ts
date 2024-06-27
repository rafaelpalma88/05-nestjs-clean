import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'

describe('Create question (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] /questions', async () => {
    await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: await hash('12345678', 8),
      },
    })

    const loginResponse = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        email: 'johndoe@example.com',
        password: '12345678',
      })

    const { access_token: accessToken } = loginResponse.body

    const responseCreateQuestion = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Title Example',
        content: 'Content Example',
      })

    expect(responseCreateQuestion.statusCode).toBe(201)
  })
})
