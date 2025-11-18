import * as srv from '../services/contract.service.js';
import asyncHandler from '../middlewares/asyncHandler.middleware.js';

export const createContract = asyncHandler(async(req, res) =>{
        const contract = await srv.createContract(req.body, req.user._id);
        res.status(201).json({ message: 'Contract created successfully', contract });
})

export const getContract = asyncHandler(async(req, res) =>{
        const contract = await srv.getContract(req.params.id);
        res.status(200).json({ contract });
});

export const signContract = asyncHandler(async(req, res) =>{
    const { id } = req.params;      // מזהה החוזה
    const { party, signatureMeta } = req.body; // סוג החתימה ו-metadata
    const user = req.user;          
    const updatedContract = await srv.signContractService(req.params.id, req.user,party, req.body.signatureMeta);
        res.status(201).json({ message: 'Contract signed successfully', updatedContract });
});

export const getContractsBySupplier = asyncHandler(async(req, res) => {
    const contracts = await srv.getContractsBySupplier(req.user._id);
    res.json({ contracts });
});

export const getContractsByClient = asyncHandler(async(req, res) => {
    const contracts = await srv.getContractsByClient(req.user._id);
    res.json({ contracts });
});

export const updateContract = asyncHandler(async(req, res) => {
    const { id } = req.params;
    const { s3Key } = req.body;
    const contract = await srv.updateContractService(id, s3Key);
    res.json({ contract });
});