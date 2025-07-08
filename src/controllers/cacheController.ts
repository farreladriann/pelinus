import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { KelasModel } from '../models/Kelas';
import { PelajaranModel } from '../models/Pelajaran';
import { KuisModel } from '../models/Kuis';

export class CacheController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            // Ambil semua data dari Kelas, Pelajaran, dan Kuis
            const kelasList = await KelasModel.find();
            const pelajaranList = await PelajaranModel.find().select('-filePdfMateri'); 
            const kuisList = await KuisModel.find();

            interface KuisCache {
                idKuis: string;
                nomorKuis: number;
                soal: string;
                opsiA: string;
                opsiB: string;
                opsiC: string;
                opsiD: string;
                opsiJawaban: string;
            }

            interface PelajaranCache {
                idPelajaran: string;
                namaPelajaran: string;
                logo: string | null;
                hashLogo: string;
                hashFilePdfMateri: string;
                kuis: KuisCache[];
            }

            interface KelasCache {
                nomorKelas: string;
                pelajaran: PelajaranCache[];
            }

            // Gabungkan data ke dalam satu objek
            const cacheData: Record<string, KelasCache> = {};
            kelasList.forEach(kelas => {
                cacheData[kelas._id.toString()] = {
                    nomorKelas: kelas.nomorKelas,
                    pelajaran: []
                };
            });

            pelajaranList.forEach(pelajaran => {
                const kelasId = pelajaran.idKelas.toString();
                if (cacheData[kelasId]) {
                    const pelajaranData: PelajaranCache = {
                        idPelajaran: pelajaran._id.toString(),
                        namaPelajaran: pelajaran.namaPelajaran,
                        logo: pelajaran.logo ? pelajaran.logo.toString('base64') : null,
                        hashLogo: pelajaran.hashLogo,
                        hashFilePdfMateri: pelajaran.hashFilePdfMateri,
                        kuis: []
                    };
                    cacheData[kelasId].pelajaran.push(pelajaranData);
                }
            });

            kuisList.forEach(kuis => {
                const pelajaranId = kuis.idPelajaran.toString();
                for (const kelasId in cacheData) {
                    const pelajaran = cacheData[kelasId].pelajaran.find(p => p.idPelajaran === pelajaranId);
                    if (pelajaran) {
                        pelajaran.kuis.push({
                            idKuis: kuis._id.toString(),
                            nomorKuis: kuis.nomorKuis,
                            soal: kuis.soal,
                            opsiA: kuis.opsiA,
                            opsiB: kuis.opsiB,
                            opsiC: kuis.opsiC,
                            opsiD: kuis.opsiD,
                            opsiJawaban: kuis.opsiJawaban
                        });
                    }
                }
            });
            
            res.status(200).json(cacheData);
        } catch (error) {
            next(error);
        }
    }
}