'use client'

import { useState } from 'react'
import TransactionEditModal from './TransactionEditModal'
import { toast } from 'react-hot-toast'
import { updateTransaction } from '@/actions/fee/transactions'

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

export default function StudentTransactionsTable({
  initialTransactions,
}: {
  initialTransactions: Transaction[]
}) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
  }

  const handleCloseModal = () => {
    setEditingTransaction(null)
  }

  const handleSaveEdit = async (updatedTransaction: EditableTransaction) => {
    try {
      const result = await updateTransaction(updatedTransaction.id, {
        amount: parseFloat(updatedTransaction.amount.toString()),
        paymentDate: new Date(updatedTransaction.paymentDate),
        method: updatedTransaction.method,
        allocations: updatedTransaction.allocations.map(a => ({
          id: a.id,
          feeTemplateId: a.feeTemplate.id,
          amountAllocated: a.amountAllocated
        }))
      })
      if (result.success && result.data) {
        setTransactions(transactions.map(t => t.id === result.data.id ? result.data : t))
        toast.success('Transaction updated successfully')
        setEditingTransaction(null)
      } else {
        throw new Error('Failed to update transaction')
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to update transaction')
    }
  }

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt Number</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocations</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="px-6 py-4 whitespace-nowrap">{new Date(transaction.paymentDate).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap">{transaction.receiptNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap">{transaction.method}</td>
              <td className="px-6 py-4 whitespace-nowrap">{transaction.amount.toFixed(2)}</td>
              <td className="px-6 py-4">
                <ul>
                  {transaction.allocations.map((allocation) => (
                    <li key={allocation.id}>
                      {allocation.feeTemplate.feeType.name}: {allocation.amountAllocated.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button onClick={() => handleEdit(transaction)} className="text-indigo-600 hover:text-indigo-900">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingTransaction && (
        <TransactionEditModal
          transaction={editingTransaction}
          onClose={handleCloseModal}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}