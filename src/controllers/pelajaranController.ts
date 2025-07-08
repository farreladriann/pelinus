import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import crypto from 'crypto';
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

            // Validasi idKelas
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

            // Cek duplikasi nama pelajaran pada kelas yang sama
            const existingPelajaran = await PelajaranModel.findOne({ namaPelajaran: namaPelajaran.trim(), idKelas });
            if (existingPelajaran) {
                throw createHttpError(409, 'Pelajaran dengan nama tersebut sudah ada di kelas ini.');
            }

            // Generate hashes for files
            const hashLogo = crypto.createHash('sha256').update(files.logo[0].buffer).digest('hex');
            const hashFilePdfMateri = crypto.createHash('sha256').update(files.filePdfMateri[0].buffer).digest('hex');

            // simpan pelajaran baru di database
            const pelajaranBaru = new PelajaranModel({
                namaPelajaran: namaPelajaran.trim(),
                logo: files.logo[0].buffer,
                hashLogo,
                idKelas,
                filePdfMateri: files.filePdfMateri[0].buffer,
                hashFilePdfMateri,
            });

            await pelajaranBaru.save();

            res.status(201).json({
                message: 'Pelajaran berhasil ditambahkan',
                pelajaran: {
                    _id: pelajaranBaru._id,
                    namaPelajaran: pelajaranBaru.namaPelajaran,
                    idKelas: pelajaranBaru.idKelas,
                    logoSize: files.logo[0].size,
                    pdfSize: files.filePdfMateri[0].size,
                    hashLogo: pelajaranBaru.hashLogo,
                    hashFilePdfMateri: pelajaranBaru.hashFilePdfMateri,
                },
            });

        } catch (error) {
            next(error);
        }
    }

    static async deletePelajaranById(req: Request, res: Response, next: NextFunction) {
        const session = await PelajaranModel.startSession();
        session.startTransaction();
        
        try {
            const { idPelajaran } = req.params;

            // Validasi idPelajaran
            if (!idPelajaran) {
                throw createHttpError(400, 'ID Pelajaran harus disediakan.');
            }

            // Cek apakah pelajaran dengan idPelajaran ada
            const pelajaran = await PelajaranModel.findById(idPelajaran).session(session);
            if (!pelajaran) {
                throw createHttpError(404, 'Pelajaran tidak ditemukan.');
            }

            // also delete any associated quizzes
            await PelajaranModel.deleteMany({ idPelajaran }, { session });

            // Hapus pelajaran dari database
            await PelajaranModel.deleteOne({ _id: idPelajaran }, { session });

            await session.commitTransaction();

            res.status(200).json({
                message: 'Pelajaran berhasil dihapus',
                idPelajaran,
            });

        } catch (error) {
            await session.abortTransaction();
            next(error);
        } finally {
            session.endSession();
        }
    }

    static async getAllPelajaranWithAllData(req: Request, res: Response, next: NextFunction) {
        try {
            const pelajaranList = await PelajaranModel.find()
                .populate('idKelas', 'nomorKelas')
                .select('-filePdfMateri');

            const result = pelajaranList.map(pelajaran => ({
                id: pelajaran._id,
                namaPelajaran: pelajaran.namaPelajaran,
                idKelas: pelajaran.idKelas,
                logo: pelajaran.logo ? pelajaran.logo.toString('base64') : null,
                hashLogo: pelajaran.hashLogo,
                hashFilePdfMateri: pelajaran.hashFilePdfMateri,
            }));

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getPdfMateri(req: Request, res: Response, next: NextFunction) {
        try {
            const { idPelajaran } = req.params;

            // Validasi idPelajaran
            if (!idPelajaran) {
                throw createHttpError(400, 'ID Pelajaran harus disediakan.');
            }

            // Cek apakah pelajaran dengan idPelajaran ada
            const pelajaran = await PelajaranModel.findById(idPelajaran);
            if (!pelajaran) {
                throw createHttpError(404, 'Pelajaran tidak ditemukan.');
            }

            if (!pelajaran.filePdfMateri) {
                throw createHttpError(404, 'File PDF materi tidak ditemukan.');
            }

            // Set response headers untuk PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${pelajaran.namaPelajaran}.pdf"`);
            
            // Kirim file PDF
            res.send(pelajaran.filePdfMateri);

        } catch (error) {
            next(error);
        }
    }
}