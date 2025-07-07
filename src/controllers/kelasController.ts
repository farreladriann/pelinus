import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { KelasModel } from '../models/Kelas';

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

    static async getAllKelas(req: Request, res: Response, next: NextFunction) {
        try {
            const kelasList = await KelasModel.find();
            res.status(200).json(kelasList);
        } catch (error) {
            next(error);
        }
    }
}