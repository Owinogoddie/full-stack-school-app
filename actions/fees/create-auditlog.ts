import prisma from "@/lib/prisma";

// Function to create fee audit log
export async function createFeeAuditLog(data: {
    entityType: string;
    entityId: string;
    action: string;
    changes: any;
    performedBy: string;
    metadata?: any;
    oldValues?:any;
newValues?:any;
  }) {
    try {
      return await prisma.feeAuditLog.create({
        data: {
          ...data,
          changes: JSON.stringify(data.changes),
          metadata: data.metadata ? JSON.stringify(data.metadata) : null
        }
      });
    } catch (error) {
      console.error('Error creating fee audit log:', error);
      throw new Error('Failed to create fee audit log');
    }
  }