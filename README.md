## Description

[Prisma](https://www.prisma.io/)

## Table of Contents <!-- omit in toc -->

-   [Setup](#setup)
-   [Env](#env)
-   [Prisma Schema](#prisma-schema)
-   [CLI](#cli)
-   [Logging](#logging)
-   [CRUD](#crud)
-   [Transaction](#transaction)
-   [Computed Fields & Static Method](#computed-fields--static-methods)
-   [Nestjs](#nestjs)

## Setup

#### 1. prisma, @prisma/client를 설치한다.

prisma는 cli를 사용하기 위해서 필요하고, @prisma/client는 코드에 사용하기 위해서 필요하다.

```bash
$ yarn add prisma @nestjs/client
```

#### 2. prisma 스키마 파일을 생성한다.

prisma 폴더가 생성되고 그 아래에 schema.prisma 파일을 생성한다. prisma cli는 기본적으로 `prisma/schema.prisma`, `schema.prisma`를 찾는다.

```bash
$ npx prisma init
```

만약에 다른 위치에 생성했다면 `--schema=PATH` 옵션을 사용하거나 package.json에 명시한다.

CLI :

```bash
$ npx prisma generate --schema=PATH/TO/schema.prisma
```

package.json :

```json
"prisma": {
  "schema": "alternative/schema.prisma"
}
```

2-1. 스키마 파일을 여러 개로 분리해서 관리하고 싶다면 추가적인 설정이 필요하다.

prisma 폴더 아래에 schema 폴더를 만들고 아래에 스키마 파일을 생성한다. 공통적인 부분인 generator와 datasource는 main.prisma에 작성하고 model은 관련 있는 테이블별로 분리하여 작성한다.

```
prisma/
└── schema/
    ├── main.prisma
    ├── post.prisma
    └── user.prisma
```

또한 generator 블록에 추가적인 프로퍼티를 추가해야 한다.

prisma/schema/main.prisma :

```javascript
generator {
  ...
  previewFeatures = ["prismaSchemaFolder"]
}
```

위의 구조와 다르게 만든다고 해도 --schema 옵션이나 package.json에 추가하면 사용할 수 있다.

```
alternative/
  ├── main.prisma
  ├── post.prisma
  └── user.prisma
```

CLI :

```bash
$ npx prisma generate --schema=alternative
```

package.json :

```json
"prisma": {
  "schema": "alternative"
}
```

#### 3. 데이터베이스에 대한 연결 정보를 추가한다.

prisma.schema의 datasource 블록에 사용할 데이터베이스와 연결 정보를 설정한다.

SQLite :

```javascript
  datasource db {
    provider = "sqlite",
    url = "file:./dev.db"
  }
```

MySQL :

```javascript
  datasource db {
    provider = "mysql"
    url = "mysql://root:root@localhost:3306/mydb"
  }
```

prisma.schema가 수정되었다면 항상 `prisma generate` 명령어를 실행해야 한다. 그래야 prisma client에서 수정된 부분에 접근할 수 있다. 또한 데이터베이스가 존재하지 않거나 테이블이 존재하지 않다면 `prisma db push` 명령어를 실행해서 데이터베이스를 업데이트 한다.

CLI :

```bash
$ npx prisma generate
$ npx prisma db push
```

usage :

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

await prisma.user.create({
    data: {
        email: 'foo@bar.com',
        name: 'baz',
    },
});

const users = await prisma.user.findMany();
```

## env

위와 같이 datasource에 데이터베이스에 대한 연결 정보를 하드 코딩 하는 것은 좋은 방법이 아니다. `prisma generate`와 같은 명령어를 사용할 때도 하드 코딩 되어 있다고 경고 메시지를 출력한다.

이를 위해서 연결 정보를 .env를 통해 관리하고 실행 시 환경 변수로 등록하여 schema.prisma에서 특별한 문법을 통해 환경 변수에 접근할 수 있다. prisma는 기본적으로 .env 파일을 읽기 때문에 별도의 설정이 필요하지 않다.

.env :

```javascript
DATABASE_URL = 'mysql://root:root@localhost:3306/mydb';
```

schema.prisma

```javascript
datasource {
  ...
  url = env("DATABASE_URL")
}
```

실제 프로젝트에서는 스테이지에 따라 .env 파일을 구분한다. prisma에서 여러 개의 .env 파일을 사용하려면 스테이지별 실행 스크립트에 dotenv를 통해 .env를 로드하는 명령어가 추가되어야 한다.

dotenv-cli 설치 :

```bash
$ yarn add dotenv-cli
```

package.json :

```json
"scripts": {
  "start:dev": "dotenv -e .env.development -- nest start --watch",
  "start:prod": "dotenv -e .env.production -- node dist/main",
}
```

## Prisma Schema

#### datasource

datasource 블록은 데이터베이스에 대한 설정을 정의한다. 지원하는 데이터베이스는 [공식 문서](https://www.prisma.io/docs/orm/overview/databases)에서 확인할 수 있다.

```javascript
datasource db {
  provider = "mysql"
  url = env("DATABASE_URL")
}
```

#### generator

generator 블록은 생성되는 Prisma Client에 대한 설정을 정의한다. (쿼리 엔진과 관련된 내용은 [공식 문서](https://www.prisma.io/docs/orm/more/under-the-hood/engines)를 확인한다.)

```javascript
generator client {
  // Prisma Client를 생성할 때 사용하는 코드이다.
  // 커뮤니티에서 만든 다양한 provider가 있지만 Prisma에서 공식적으로 지원하는 것은 아니기 때문에 사용에 주의가 필요하다.
  provider = 'prisma-client-js'

  // Prisma Client는 기본적으로 node_modules/.prisma/client에 생성된다.
  // output은 생성되는 경로를 변경할 수 있다.
  output = "./generated/prisma-client-js"

  // 'library' 또는 'binary'를 사용할 수 있다. 기본값은 'library'이다.
  // 'library'는 Node-API 라이브러리 형태로 제공한다. 오버헤드를 줄이기 위해서 이 방식을 권장한다.
  // 'binary'는 실행 가능한 바이너리 형태로 제공한다.
  // ('binary'는 언제 사용하는지 모르겠다.)
  engineType = 'library'

  // Preview 기능을 사용하기 위한 설정이다.
  previewFeatures = ['metrics']

  // Prisma Client는 배포되는 플랫폼에 따라 알맞은 엔진을 선택해서 사용해야 한다.
  // binaryTargets는 플랫폼에 맞는 엔진 파일을 명시적으로 지정한다.
  binaryTargets = ["native", "linux-arm64-openssl-1.0.x"]
}
```

output을 통해 Prisma Client가 생성되는 경로를 변경했다면 코드에서 Prisma Client를 import하는 경로도 변경해야 한다. output은 schema.prisma의 위치를 기준으로 한다.

```typescript
import { PrismaClient } from 'prisma/generated/prisma-client-js';

const prisma = new PrismaClient();
```

#### model

model 블록은 엔티티를 정의하기 위해서 사용한다. model은 애플리케이션에서 엔티티를 나타내고 데이터베이스의 테이블과 연결된다. 또한 Prisma Client API에서 사용할 수 있는 쿼리의 기반을 형성하고 타입스크립트를 위한 타입을 정의한다.

```typescript
model User {
  id Int @id @default(autoincrement())
  email String
  nickname String
}
```

##### Block Attribute (@@)

-   `@@map`: 기본적으로 모델명과 동일한 테이블명으로 연결되지만 다르게 설정하고 싶을 경우 테이블명을 지정할 수 있다.

```typescript
model User {
  id Int @id @default(autoincrement())
  email String

  @@map("users")
}
```

-   `@@id`: 복합키를 정의한다.

```typescript
model User {
  firstName String
  lastName String

  // 복합키의 이름은 각 필드를 '_'로 연결한 문자열이 된다.
  // ex. firstName_lastName
  @@id([firstName, lastName])

  // 명시적으로 지정할 수 있다.
  @@id(name: "fullName", fields: [firstName, lastName])
}
```

-   `@@unique`: 유니크 제약조건을 정의한다.

```typescript
model User {
  id Int @id @default(autoincrement())
  firstName String
  lastName String

  // 제약조건의 이름은 각 필드를 '_'로 연결한 문자열이 된다.
  // ex. firstName_lastName
  @@unique([firstName, lastName])

  // 명시적으로 지정할 수 있다.
  @@unique(name: "fullName", fields: [firstName, lastName])
}
```

-   @@id와 @@unique로 정의한 복합키와 유니크 제약조건은 Prisma Client의 findUnique에서 접근할 수 있다.

```typescript
const prisma = new PrismaClient();
await prisma.user.findUnique({
  where: {
    // name을 지정하지 않았다면
    firstName_lastName: {
      firstName: '...',
      lastName: '...'
    }
    // name을 지정했다면
    fullName: {
      firstName: '...',
      lastName: '...'
    }
  }
})
```

-   `@@index`: 인덱스를 정의한다.

```typescript
model Post {
	id Int @id @default(autoincrement())
	title String
	content String?

	@@index([title, content])
}
```

-   `@@ignore`: Prisma Client API에서 노출되지 않도록 설정한다.

```typescript
model Post {
	id Int @id @default(autoincrement())
	title String

	@@ignore
}
```

##### Field Attribute (@)

-   `@map`: 기본적으로 필드명과 동일한 컬럼명과 연결되지만 다르게 설정하고 싶을 경우 컬럼명을 지정할 수 있다.

```typescript
model User {
  id Int @id @default(autoincrement())
  firstName String @map("first_name")
}
```

-   `@id`: 해당 필드를 Primary Key로 설정한다.

```typescript
model User {
  id @id
}
```

-   `@unique`: 해당 필드를 유니크로 설정한다.

```typescript
model User {
  id @id
  email String @unique
}
```

-   `@default`: 기본값을 설정한다.

```typescript
model User {
  id Int @id @default(autoincrement())
  isDelete Boolean @default(false)
}
```

-   `@relation`: 관계 필드를 정의한다.

```typescript
model User {
  id @id @default(autoincrement())
  proflie Profile
}

model Profile {
  id Int @id @default(autoincrement())
  userId Int @unique
  user User @relation(fields: [userId], references: [id])
}
```

-   `@db`: 네이티브 타입을 설정한다. 스칼라 타입은 데이터베이스의 타입과 연결된다. 하지만 데이터베이스에서 지원하는 다른 타입과 연결할 때 사용한다. 예를 들어, String은 mysql에서 varchar(191)로 연결된다. 이를 char(50)와 연결하고 싶다고 할 때 사용할 수 있다.

```typescript
model User {
  id Int @id @default(autoincrement())
  nickname String @db.Char(20)
}
```

-   `@ignore`: Prisma Client API에서 노출되지 않도록 설정한다.

```typescript
  model User {
    id Int @id @default(autoincrement())
    createdAt DateTime @ignore
  }
```

## CLI

#### prisma init

<small>schema.prisma를 생성한다.</small>

```bash
$ npx prisma init
```

#### prisma generate

<small>Prisma Client를 생성한다.</small>

```bash
$ npx prisma generate
```

#### prisma db push

<small>schema.prisma의 변경사항을 데이터베이스에 반영한다. 마이그레이션 기록이 남지 않는다.</small>

```bash
$ npx prisma db push
```

#### prism db pull

<small>데이터베이스를 분석하여 schema.prisma에 추가한다.</small>

```bash
$ npx prisma db pull
```

#### prisma migrate dev

<small>마이그레이션 기록을 추가하고 데이터베이스에 반영한다. 주로 로컬에서 개발할 때 사용한다.</small>

```bash
$ npx prisma migrate dev

# --name 속성을 지정하지 않아도 명령어 실행 중에 입력하게 된다.
$ npx prisma migrate dev --name [MIGRATION_NAME]
```

#### prisma migrate deploy

<small>반영되지 않은 마이그레이션 기록을 데이터베이스에 반영한다. 주로 프로덕션 환경에서 사용한다.</small>

```bash
$ npx prisma migrate deploy
```

#### prisma migrate reset

<small>데이터베이스를 초기화하고 모든 마이그레이션을 다시 적용한다.</small>

```bash
$ npx prisma migrate reset
```

#### prisma migrate status

<small>마이그레이션 상태를 확인한다. 적용되지 않은 마이그레이션 기록을 확인할 수 있다. 적용된 마이그레이션 기록은 \_prisma_migrations 테이블에서 확인할 수 있다.</small>

```bash
$ npx prisma migrate status
```

#### prisma migrate diff

<small>두 데이터베이스 간의 차이를 출력한다. 옵션을 통해 실행 가능한 SQL문을 출력할 수 있다.</small>

```bash
$ npx prisma migrate diff \
--from-url "mysql://root:root@localhost:3306/fromdb"
--to-url "mysql://root:root@localhost:3306/todb"
# 동기화를 위한 SQL을 출력한다.
--script
```

#### prisma studio

<small>데이터 조회 및 수정, 삭제가 가능한 GUI를 실행한다.</small>

```bash
$ npx prisma studio
```

## Logging

Prisma Client 인스턴스를 생성할 때 log 옵션을 추가한다. 로그 출력 방식에는 표준 출력과 이벤트 기반이 있다.

표준 출력은 로그를 콘솔에 바로 출력한다.

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'error', 'info', 'warn'],
});
```

example:

```bash
prisma:query BEGIN
prisma:query INSERT INTO `mydb`.`User` (`id`,`email`,`name`) VALUES (?,?,?)
prisma:query SELECT `mydb`.`User`.`id`, `mydb`.`User`.`email`, `mydb`.`User`.`name` FROM `mydb`.`User` WHERE `mydb`.`User`.`id` = ? LIMIT ? OFFSET ?
prisma:query COMMIT
```

이벤트 기반은 이벤트를 발생시킨다. 이벤트를 확인하려면 $on을 통해 바인딩 해야 한다.

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query'
    },
    ...
  ]
});

prisma.$on('query', (e) => {
  console.log(
    `${e.target} ${e.timestamp.toISOString()} - ${e.query} ${e.params} ${e.duration}ms`,
  );
});
```

example:

```bash
2024-08-30T07:40:44.095Z
quaint::connector::metrics
BEGIN
[]
0ms

2024-08-30T07:40:44.096Z
quaint::connector::metrics
INSERT INTO `mydb`.`User` (`id`,`email`,`name`) VALUES (?,?,?)
[null,"test@test","test"]
0ms

2024-08-30T07:40:44.096Z
quaint::connector::metrics
SELECT `mydb`.`User`.`id`, `mydb`.`User`.`email`, `mydb`.`User`.`name` FROM `mydb`.`User` WHERE `mydb`.`User`.`id` = ? LIMIT ? OFFSET ?
[11,1,0]
0ms

2024-08-30T07:40:44.099Z
quaint::connector::metrics
COMMIT
[]
2ms
```

## CRUD

#### Create

```typescript
const user = await prisma.user.create({
    data: {
        email: '...',
        name: '...',
    },
});
```

#### Create (relation과 함께 생성할 수 있다.)

```typescript
const user = await prisma.user.create({
    data: {
        email: '...',
        name: '...',
        posts: {
            create: [{ title: '...' }, { title: '...' }],
        },
    },
    // return with
    include: {
        posts: true,
    },
});
```

#### Create Many (relation은 함께 생성할 수 없다.)

```typescript
// { count: 4 }
const result = await prisma.user.createMany({
    data: [
        { email: '...', name: '...' },
        { email: '...', name: '...' },
        { email: '...', name: '...' },
        { email: '...', name: '...' },
    ],
});

// PostgreSQL, CockroachDB, SQLite만 지원한다.
const users = await prisma.user.createManyAndReturn({
    data: [
        { email: '...', name: '...' },
        { email: '...', name: '...' },
        { email: '...', name: '...' },
        { email: '...', name: '...' },
    ],
    include: {
        posts: true,
    },
});
```

#### Update

```typescript
const user = await prisma.user.update({
    where: { id: 1 },
    data: { email: 'test@test.com' },
});
```

#### Update (relation과 함께 업데이트할 수 있다.)

```typescript
const user = await prisma.user.update({
    where: { id: 1 },
    data: {
        email: '...',
        posts: {
            update: {
                where: { id: 10 },
                data: {
                    title: '...',
                },
            },
        },
    },
});
```

#### UpdateMany (relation은 함께 업데이트할 수 없다.)

```typescript
// { count: 3 }
const result = await prisma.user.updateMany({
    where: { id: { in: [1, 2, 3] } },
    data: {
        isDelete: true,
    },
});
```

#### Upsert (relation과 함께 수정 & 생성할 수 있다.)

```typescript
const user = await prisma.user.upsert({
    where: { id: 1 },
    update: {
        email: '...',
        posts: {
            create: {
                title: '...',
            },
            update: {
                where: { id: 10 },
                data: { title: '...' },
            },
        },
    },
    create: {
        email: '...',
        name: '...',
        posts: {
            create: { title: '...' },
        },
    },
    include: {
        posts: true,
    },
});
```

#### Delete

<small>@id 필드 또는 @unique 필드를 통해서만 삭제할 수 있다.</small>

```typescript
const post = await prisma.post.delete({
    where: { id: 1 },
});
const user = await prisma.user.delete({
    where: { id: 1 },
    include: {
        posts: true,
    },
});
```

#### DeleteMany

```typescript
// { count: 3 }
const result = await prisma.post.deleteMany({
    where: {
        title: {
            contains: 'title',
        },
    },
});
```

#### FindUnique

<small>@id 필드 또는 @unique 필드를 통해서만 조회할 수 있다.</small>

```typescript
// null을 반환할 수 있다.
const user = await prisma.user.findUnique({
    where: { id: 1 },
});

// null을 반환하지 않고 에러를 발생시킨다.
const user = await prisma.user.findUniqueOrThrow({
    where: { id: 1 },
});
```

#### FindFirst

```typescript
// null을 반환할 수 있다.
const user = await prisma.user.findFirst({
    where: {
        name: {
            contains: 'test',
        },
    },
});

// null을 반환하지 않고 에러를 발생시킨다.
const user = await prisma.user.findFirstOrThrow({
    where: {
        name: {
            contains: 'test',
        },
    },
});
```

#### FindMany

```typescript
import { Prisma } from '@prisma/client';
const user = await prisma.user.findMany({
    where: {
        name: {
            not: null,
        },
    },
    include: {
        posts: true,
    },
    orderBy: {
        name: Prisma.SortOrder.asc,
    },
    take: 10,
    skip: 100,
});
```

Count

```typescript
const count = await prisma.user.count({
    where: {
        name: null,
    },
});
```

## Transaction

#### Sequential

```typescript
const [createdUser, updatedUser] = await prisma.$transaction([
  prisma.user.create({ ... }),
  prisma.user.update({ ... })
]);
```

> Sequential Transaction과 함께 Find\*OrThrow를 사용할 때 Null로 인해 에러가 발생해도 롤백이 되지 않는다.

#### Interactive

```typescript
await prisma.$transaction(async (tx) => {
  const createdUser = await prisma.user.create({ ... });

  const updatedUser = await prisma.user.update({ ... });
});
```

## Computed Fields & Static Methods

#### Computed Fields

```typescript
const prisma = new PrismaClient().$extends({
    result: {
        user: {
            fullName: {
                needs: { firstName: true, lastName: true },
                compute(user) {
                    return `${user.firstName} ${user.lastName}`;
                },
            },
        },
    },
});

const user = await prisma.user.findUnique({
    where: { id: 1 },
});
console.log(user.fullName);
```

#### Static Methods

```typescript
const prisma = new PrismaClient().$extends({
    model: {
        user: {
            async signUp(email: string, name: string) {
                return prisma.user.create({
                    data: {
                        email,
                        name,
                    },
                });
            },
        },
    },
});

const user = await prisma.user.signUp('test@test.com', 'test');
```

## Nestjs

Nestjs에서 Prisma를 사용하기 위해서 Prisma Client를 상속한 Prisma Service를 만든다.

example:

```typescript
// prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injetable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    onModuleInit() {
        this.$connect();
    }
}

// user.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService) {}

    async findOne(id: number) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id,
            },
        });
        return user;
    }
}

// user.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
    providers: [PrismaService, UserService],
})
export class UserModule {}
```

하지만 $extends를 사용하려면 추가적인 설정이 필요하다. 위의 방식에서 생성자나 OnModuleInit에서 $extends를 사용할 수 있지만 타입이 제대로 적용되지 않는다.

아래와 같이 Prisma Service에서 Prisma Client를 상속하는 대신 확장한 $extends가 적용된 Prisma Client를 상속하도록 한다.

example:

```typescript
import { PrismaClient } from '@prisma/client';
import { Injectable, OnModuleInit } from '@nestjs/common';

const getExtendedPrismaClient = () => {
    const prisma = new PrismaClient().$extends({
        result: {
            user: {
                fullName: {
                    needs: { firstName: true, lastName: true },
                    compute(user) {
                        return `${firstName} ${lastName}`;
                    },
                },
            },
        },
        model: {
            user: {
                createBy: async (args: {
                    firstName: string;
                    lastName: string;
                }) => {
                    return prisma.user.create({
                        data: {
                            firstName,
                            lastName,
                        },
                    });
                },
            },
        },
    });
    return prisma;
};

const ExtendedPrismaClient = class {
    constructor {
        return getExtendedPrismaClient();
    }
} as new () => ReturnType<
    typeof getExtendedPrismaClient
>;

@Injectable()
export class PrismaService extends ExtendedPrismaClient implements OnModuleInit {
    onModuleInit() {
        this.$connect();
    }
}
```

`getExtendedPrismaClient`에서 $extends에 많은 내용을 작성하면 코드가 길어지고 가독성이 좋지 않기 때문에 별도로 분리할 필요가 있다. 모델별로 extension을 작성하여 $extends를 체이닝 하는 방식으로 구현할 수 있다.

하지만 extensions을 분리할 때 `Prisma.defineExtension`을 사용하는데 이때 주의해야 할 점이 있다. `Prisma.defineExtension`은 Prisma Client를 매개변수로 받게 되는데 이 Prisma Client는 $extends가 적용되지 않은 기본 타입이기 때문에 model 정의에서 이 Prisma Client를 사용하게 되면 result에 추가한 필드가 적용되지 않는다.

```typescript
import { Prisma } from '@prisma/client';

export const employeeExtension = Prisma.defineExtension((prisma) => {
    return prisma.$extends({
        result: {
            user: {
                fullName: {
                    needs: { firstName: true, lastName: true },
                    compute(data) {
                        return `${firstName} ${lastName}`;
                    },
                },
            },
        },
        model: {
            user: {
                createBy: async (args: {
                    firstName: string;
                    lastName: string;
                }) => {
                    return prisma.user.create({
                        data: {
                            firstName,
                            lastName,
                        },
                    });
                },
            },
        },
    });
});

const user = await this.prismaService.user.createBy({ firstName, lastName });

// 존재하지 않는 속성이다.
user.fullName;
```

이 문제를 해결하려면 $extends한 Prisam Client를 사용하도록 변경하고 해당 Prisma Client를 반환하도록 한다.

```typescript
import { Prisma } from '@prisma/client';

export const employeeExtension = Prisma.defineExtension((prisma) => {
    const extendedPrisma = prisma.$extends({
        ...
        model: {
            user: {
                createBy: async (args: { firstName: string, lastName: string }) => {
                    // prisma -> extendedPrisma
                    return extendedPrisma.user.create({
                        data: {
                            firstName,
                            lastName
                        }
                    })
                }
            }
        }
    });
    return extendedPrisma;
});
```

이렇게 만든 extension을 `getExtendedPrismaClient`에 추가하면 된다.

```typescript
import { employeeExtension } from './employee.extension';
import { departmentExtension } from './department.extension';

const getExtendedPrismaClient = () => {
    const prisma = new PrismaClient()
        .$extends(employeeExtension)
        .$extends(departmentExtension);
    return prisma;
};
```
