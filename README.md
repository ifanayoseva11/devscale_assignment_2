# AI Workout Planner - Step 1

Fondasi backend untuk aplikasi `AI Workout Planner` dengan gaya arsitektur yang mirip dengan referensi assignment:

- API server menggunakan Hono
- Database menggunakan Prisma + PostgreSQL
- Queue worker menggunakan BullMQ + Redis
- Domain utama: pembuatan workout plan

## Menjalankan project

1. Install dependency
2. Salin `.env.example` menjadi `.env`
3. Jalankan PostgreSQL dan Redis
4. Jalankan migration Prisma
5. Jalankan API server dan worker

## Endpoint utama

- `POST /workout-plans`
- `GET /workout-plans`
- `GET /workout-plans/:id`
- `GET /workout-plans/:id/view`

## Tujuan step 1

Step ini menyiapkan pondasi aplikasi yang sudah bisa:

- menerima input user untuk workout plan
- menyimpan request ke database
- memproses request secara asynchronous lewat worker
- menghasilkan workout plan awal berbasis rule sederhana

Langkah berikutnya bisa difokuskan ke integrasi AI sungguhan memakai OpenAI.

## Step 2 dan penyesuaian requirement

Project ini sekarang memakai workflow AI bertahap:

- `POST /workout-plans` menerima input user
- request disimpan ke database lewat Prisma
- worker memproses job dari queue
- AI menjalankan beberapa prompt:
  - requirement extractor
  - workout structure planner
  - evaluator
- hasil tiap tahap penting disimpan ke database
- evaluator memberi score, feedback, dan final response

Jika schema berubah lagi:

1. isi `OPENAI_API_KEY` di file `.env`
2. jalankan `prisma generate`
3. buat migration baru
4. jalankan server dan worker
