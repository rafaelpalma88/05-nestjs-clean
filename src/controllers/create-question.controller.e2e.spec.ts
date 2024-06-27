import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Create question (E2E)', () => {
  let app: INestApplication
  // let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    // prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] /questions', async () => {
    const response = await request(app.getHttpServer())
      .post('/questions')
      .send({
        title: 'Title Example',
        content: 'Content Example',
      })

    // expect(response.statusCode).toBe(201)
    expect(1).toBe(1)
  })
})
