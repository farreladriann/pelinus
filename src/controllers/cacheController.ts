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
                kuis: KuisCache[];
            }

            interface KelasCache {
                nomorKelas: string;
                pelajaran: PelajaranCache[];
            }

            const cacheData: Record<string, KelasCache> = {};
            kelasList
                .sort((a, b) => a.nomorKelas.toLowerCase().localeCompare(b.nomorKelas.toLowerCase()))
                .forEach(kelas => {
                    cacheData[kelas._id.toString()] = {
                        nomorKelas: kelas.nomorKelas,
                        pelajaran: []
                    };
                });

            function romanToNumber(roman: string) {
                if (!roman) return 0;

                const romanMap: Record<string, number> = {
                    'I': 1, 'V': 5, 'X': 10, 'L': 50
                };

                let result = 0;
                let prevValue = 0;

                for (let i = roman.length - 1; i >= 0; i--) {
                    const currentValue = romanMap[roman[i]];

                    if (currentValue < prevValue) {
                        result -= currentValue; // Subtraction case (IV, IX, XL, etc.)
                    } else {
                        result += currentValue; // Addition case
                    }

                    prevValue = currentValue;
                }

                return result;
            }

            function parseSubjectName(name: string) {
                const romanPattern = /^(.+?)\s+(XL|L|X{0,4}(?:IX|IV|V?I{0,3}))(?:\s|$)/i;
                const match = name.match(romanPattern);

                if (match && match[2]) {
                    const romanNumeral = match[2].toUpperCase();
                    return {
                        subject: match[1].trim(),
                        roman: romanNumeral,
                        romanValue: romanToNumber(romanNumeral)
                    };
                }

                return {
                    subject: name,
                    roman: '',
                    romanValue: 0
                };
            }

            pelajaranList
                .sort((a, b) => {
                    const parsedA = parseSubjectName(a.namaPelajaran);
                    const parsedB = parseSubjectName(b.namaPelajaran);

                    const subjectComparison = parsedA.subject.toLowerCase().localeCompare(parsedB.subject.toLowerCase());

                    if (subjectComparison !== 0) {
                        return subjectComparison;
                    }

                    return parsedA.romanValue - parsedB.romanValue;
                })
                .forEach(pelajaran => {
                    const kelasId = pelajaran.idKelas.toString();
                    if (cacheData[kelasId]) {
                        const pelajaranData = {
                            idPelajaran: pelajaran._id.toString(),
                            namaPelajaran: pelajaran.namaPelajaran,
                            kuis: []
                        };
                        cacheData[kelasId].pelajaran.push(pelajaranData);
                    }
                });

            kuisList
                .sort((a, b) => a.nomorKuis - b.nomorKuis)
                .forEach(kuis => {
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
                            break; 
                        }
                    }
                });

            res.status(200).json(cacheData);
        } catch (error) {
            next(error);
        }
    }
}