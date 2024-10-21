'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

type Transaction = {
  id: string
  amount: number
  paymentDate: Date
  method: string
  receiptNumber: string
  allocations: {
    id: string
    amountAllocated: number
    feeTemplate: {
      id: string
      feeType: {
        name: string
      }
    }
  }[]
}

type EditableTransaction = Omit<Transaction, 'paymentDate'> & { paymentDate: string }

type Props = {
  transaction: Transaction
  onClose: () => void
  onSave: (transaction: EditableTransaction) => Promise<void>
}

export default function TransactionEditModal({ transaction, onClose, onSave }: Props) {
  const [editedTransaction, setEditedTransaction] = useState<EditableTransaction>({
    ...transaction,
    paymentDate: new Date(transaction.paymentDate).toISOString().split('T')[0],
  })
  const [totalAllocated, setTotalAllocated] = useState(0)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    const total = editedTransaction.allocations.reduce((sum, allocation) => sum + allocation.amountAllocated, 0)
    setTotalAllocated(total)
    setIsValid(total === editedTransaction.amount)
  }, [editedTransaction])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditedTransaction((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }))
  }

  const handleAllocationChange = (index: number, value: string) => {
    const newAmount = parseFloat(value) || 0
    const newAllocations = [...editedTransaction.allocations]
    newAllocations[index] = {
      ...newAllocations[index],
      amountAllocated: newAmount
    }
    setEditedTransaction((prev) => ({ ...prev, allocations: newAllocations }))
  }

  const distributeRemaining = () => {
    const remaining = editedTransaction.amount - totalAllocated
    if (remaining <= 0) return

    const newAllocations = [...editedTransaction.allocations]
    const nonZeroAllocations = newAllocations.filter(a => a.amountAllocated > 0)
    
    if (nonZeroAllocations.length === 0) {
      // If all allocations are zero, distribute equally
      const equalShare = remaining / newAllocations.length
      newAllocations.forEach(a => a.amountAllocated = equalShare)
    } else {
      // Distribute proportionally among non-zero allocations
      const totalNonZero = nonZeroAllocations.reduce((sum, a) => sum + a.amountAllocated, 0)
      nonZeroAllocations.forEach(a => {
        const share = (a.amountAllocated / totalNonZero) * remaining
        const index = newAllocations.findIndex(na => na.id === a.id)
        newAllocations[index].amountAllocated += share
      })
    }

    setEditedTransaction((prev) => ({ ...prev, allocations: newAllocations }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) {
      toast.error('Total allocations must equal the transaction amount')
      return
    }
    await onSave(editedTransaction)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold mb-4">Edit Transaction</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Date:
              <input
                type="date"
                name="paymentDate"
                value={editedTransaction.paymentDate}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Amount:
              <input
                type="number"
                name="amount"
                value={editedTransaction.amount}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Method:
              <select
                name="method"
                value={editedTransaction.method}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CREDIT_CARD">Credit Card</option>
              </select>
            </label>
          </div>
          <h3 className="text-md font-semibold mb-2">Allocations:</h3>
          {editedTransaction.allocations.map((allocation, index) => (
            <div key={allocation.id} className="mb-2">
              <label className="block text-gray-700 text-sm font-bold">
                {allocation.feeTemplate.feeType.name}:
                <input
                  type="number"
                  value={allocation.amountAllocated}
                  onChange={(e) => handleAllocationChange(index, e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </label>
            </div>
          ))}
          <div className="mt-4">
            <p className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              Total Allocated: {totalAllocated.toFixed(2)} / {editedTransaction.amount.toFixed(2)}
            </p>
            {!isValid && (
              <button
                type="button"
                onClick={distributeRemaining}
                className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Distribute Remaining
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mt-4">
            <button
              type="submit"
              disabled={!isValid}
              className={`${
                isValid ? 'bg-blue-500 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}