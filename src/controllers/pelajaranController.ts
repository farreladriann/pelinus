import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { PelajaranModel } from '../models/Pelajaran';
import { KelasModel } from '../models/Kelas';

export class PelajaranController {
    static async addPelajaran(req: Request, res: Response, next: NextFunction) {
        try {
            const { namaPelajaran, idKelas } = req.body;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            // Validasi input
            if (!namaPelajaran || typeof namaPelajaran !== 'string' || namaPelajaran.trim() === '') {
                throw createHttpError(400, 'Properti "namaPelajaran" harus berupa string yang tidak kosong.');
            }

            if (!idKelas) {
                throw createHttpError(400, 'Properti "idKelas" harus disediakan.');
            }

            // Validasi file uploads
            if (!files || !files.logo || !files.filePdfMateri) {
                throw createHttpError(400, 'Logo dan file PDF materi harus diupload.');
            }

            // Validasi apakah kelas exists
            const kelasExists = await KelasModel.findById(idKelas);
            if (!kelasExists) {
                throw createHttpError(400, 'Kelas dengan ID tersebut tidak ditemukan.');
            }

            // Cek duplikasi nama pelajaran
            const existingPelajaran = await PelajaranModel.findOne({ namaPelajaran: namaPelajaran.trim() });
            if (existingPelajaran) {
                throw createHttpError(409, 'Pelajaran dengan nama tersebut sudah ada.');
            }

            const pelajaranBaru = new PelajaranModel({
                namaPelajaran: namaPelajaran.trim(),
                logo: files.logo[0].buffer,
                idKelas,
                filePdfMateri: files.filePdfMateri[0].buffer,
            });

            // Simpan pelajaran baru ke database
            await pelajaranBaru.save();

            res.status(201).json({
                message: 'Pelajaran berhasil ditambahkan',
                pelajaran: {
                    _id: pelajaranBaru._id,
                    namaPelajaran: pelajaranBaru.namaPelajaran,
                    idKelas: pelajaranBaru.idKelas,
                    logoSize: files.logo[0].size,
                    pdfSize: files.filePdfMateri[0].size,
                },
            });

        } catch (error) {
            next(error);
        }
    }

    static async getAllPelajaranWithAllData(req: Request, res: Response, next: NextFunction) {
        try {
            const pelajaranList = await PelajaranModel.find()
                .populate('idKelas', 'nomorKelas');

            const result = pelajaranList.map(pelajaran => ({
                id: pelajaran._id,
                namaPelajaran: pelajaran.namaPelajaran,
                idKelas: pelajaran.idKelas,
                logo: pelajaran.logo ? pelajaran.logo.toString('base64') : null,
                filePdfMateri: pelajaran.filePdfMateri ? pelajaran.filePdfMateri.toString('base64') : null,
            }));

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getPelajaranById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const pelajaran = await PelajaranModel.findById(id)
                .populate('idKelas', 'nomorKelas')
                .select('-logo -filePdfMateri'); // Exclude binary data

            if (!pelajaran) {
                throw createHttpError(404, 'Pelajaran tidak ditemukan');
            }

            res.status(200).json(pelajaran);
        } catch (error) {
            next(error);
        }
    }

    static async getLogo(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const pelajaran = await PelajaranModel.findById(id).select('logo');

            if (!pelajaran || !pelajaran.logo) {
                throw createHttpError(404, 'Logo tidak ditemukan');
            }

            res.set('Content-Type', 'image/jpeg');
            res.send(pelajaran.logo);
        } catch (error) {
            next(error);
        }
    }

    static async getPdf(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const pelajaran = await PelajaranModel.findById(id).select('filePdfMateri namaPelajaran');

            if (!pelajaran || !pelajaran.filePdfMateri) {
                throw createHttpError(404, 'File PDF tidak ditemukan');
            }

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${pelajaran.namaPelajaran}.pdf"`
            });
            res.send(pelajaran.filePdfMateri);
        } catch (error) {
            next(error);
        }
    }

    static async getPelajaranWithAllData(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;

        // Cari pelajaran berdasarkan ID
        const pelajaran = await PelajaranModel.findById(id)
            .populate('idKelas', 'nomorKelas'); // Populate data kelas

        if (!pelajaran) {
            throw createHttpError(404, 'Pelajaran tidak ditemukan');
        }

        // Encode logo dan file PDF ke Base64
        const logoBase64 = pelajaran.logo ? pelajaran.logo.toString('base64') : null;
        const pdfBase64 = pelajaran.filePdfMateri ? pelajaran.filePdfMateri.toString('base64') : null;

        // Kirim semua data dalam JSON
        res.status(200).json({
            id: pelajaran._id,
            namaPelajaran: pelajaran.namaPelajaran,
            idKelas: pelajaran.idKelas,
            logo: logoBase64, // Base64 string untuk logo
            filePdfMateri: pdfBase64, // Base64 string untuk file PDF
        });
    } catch (error) {
        next(error);
    }
}
}