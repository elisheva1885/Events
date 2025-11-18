import * as repo from '../repositories/contract.repository.js';
import Supplier from '../models/supplier.model.js';

// 🔹 יצירת חוזה חדש
export async function createContract(data, userId) {
    // Get the supplier document for this user
    const supplier = await Supplier.findOne({ user: userId });
    if (!supplier) throw new Error('Supplier not found');
    
    const contractData = { 
        ...data, 
        supplierId: supplier._id,
        // If clientId is not provided, don't set it (it should come from the request)
    };
    return await repo.createContract(contractData);
}

export async function getContract(contractId) {
    const contract = await repo.getContractById(contractId);
    if (!contract) throw new Error('Contract not found');
    return contract;
}


export async function signContractService(contractId, user, party,signatureMeta = {}) {
      if (!['client', 'supplier'].includes(party)) throw new Error('Invalid party');
    const contract = await repo.getContractById(contractId);
    if (!contract) throw new Error('Contract not found');
      if (party === 'supplier') {
    if (contract.supplierSignature) throw new Error('Supplier has already signed');
    contract.supplierSignature = { signatureMeta, at: new Date() };
  }
  if (party === 'client') {
    if (contract.clientSignatures.some(sig => sig.clientId.equals(user._id))) {
      throw new Error('Client has already signed');
    }
    contract.clientSignatures.push({ clientId: user._id, signatureMeta, at: new Date() });
  }

    return repo.updateContract(contractId, contract);
}

export async function getContractsBySupplier(userId) {
    return await repo.getContractsBySupplier(userId);
}

export async function getContractsByClient(userId) {
    return await repo.getContractsByClient(userId);
}

export async function updateContractService(contractId, s3Key) {
    return await repo.updateContract(contractId, { s3Key });
}
