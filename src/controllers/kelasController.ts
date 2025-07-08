import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { KelasModel } from '../models/Kelas';
import { PelajaranModel } from '../models/Pelajaran';
import { KuisModel } from '../models/Kuis';

export class KelasController {
    static async addKelas(req: Request, res: Response, next: NextFunction) {
        try {
            const { nomorKelas } = req.body;

            // Validasi nomorKelas and regex only allows alphanumeric
            if (!nomorKelas || typeof nomorKelas !== 'string' || nomorKelas.trim() === '' || !/^[a-zA-Z0-9]+$/.test(nomorKelas)) {
                throw createHttpError(400, 'Properti "nomorKelas" harus berupa string yang tidak kosong.');
            }

            // Cek Duplikasi
            const existingKelas = await KelasModel.findOne({ nomorKelas });
            if (existingKelas) {
                throw createHttpError(409, 'Kelas dengan nomor tersebut sudah ada.');
            }

            const kelasBaru = new KelasModel({
                nomorKelas: nomorKelas.trim(),
            });

            // Simpan kelas baru ke database
            await kelasBaru.save();

            res.status(201).json({
                message: 'Kelas berhasil ditambahkan',
                kelas: kelasBaru,
            });

        } catch (error) {
            next(error);
        }
    }

    static async deleteKelas(req: Request, res: Response, next: NextFunction) {
        const session = await KelasModel.db.startSession();
        session.startTransaction();
        try {
            const { idKelas } = req.params;

            // Validasi idKelas
            if (!idKelas) {
                throw createHttpError(400, 'ID Kelas harus disediakan.');
            }

            // Cek apakah kelas dengan idKelas ada
            const kelas = await KelasModel.findById(idKelas).session(session);
            if (!kelas) {
                throw createHttpError(404, 'Kelas tidak ditemukan.');
            }

            // Cari semua pelajaran yang terkait dengan kelas ini
            const pelajaranTerkait = await PelajaranModel.find({ idKelas: idKelas }).session(session);
            const pelajaranIds = pelajaranTerkait.map(p => p._id);

            // Hapus semua kuis yang terkait dengan pelajaran-pelajaran tersebut
            if (pelajaranIds.length > 0) {
                await KuisModel.deleteMany({ idPelajaran: { $in: pelajaranIds } }).session(session);
            }

            // Hapus semua pelajaran yang terkait dengan kelas ini
            await PelajaranModel.deleteMany({ idKelas }).session(session);

            // Hapus kelas itu sendiri
            await KelasModel.findByIdAndDelete(idKelas).session(session);

            await session.commitTransaction();

            res.status(200).json({
                message: 'Kelas beserta pelajaran dan kuis terkait berhasil dihapus',
            });

        } catch (error) {
            await session.abortTransaction();
            next(error);
        } finally {
            session.endSession();
        }
    }
}