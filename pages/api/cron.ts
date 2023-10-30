// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { clearDatabase } from '@/utils/generalBackendUtils'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {

        const obj = clearDatabase();
        res.status(200).json(obj);

    } catch (error) {
        res.status(400).json(error)
    }

}
