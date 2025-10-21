import { NextRequest, NextResponse } from 'next/server';

interface OmiseChargeResponse {
    object: string;
    id: string;
    livemode: boolean;
    location: string;
    amount: number;
    currency: string;
    description?: string;
    status: 'pending' | 'successful' | 'failed' | 'expired' | 'reversed';
    capture: boolean;
    authorized: boolean;
    paid: boolean;
    refunded: number;
    refunds: unknown[];
    failure_code?: string;
    failure_message?: string;
    card?: unknown;
    source?: unknown;
    transaction?: string;
    created: string;
    expires_at?: string;
    expired_at?: string;
    expired: boolean;
    return_uri?: string;
    receipt_code?: string;
    receipt_number?: string;
    metadata: Record<string, unknown>;
    fee: number;
    fee_vat: number;
    interest: number;
    interest_vat: number;
    net: number;
    fee_details: unknown[];
    schedule?: string;
    customer?: string;
    ip?: string;
    dispute?: string;
    created_at: string;
    updated_at: string;
}

interface OmiseErrorResponse {
    object: string;
    location: string;
    code: string;
    message: string;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ chargeId: string }> }
) {
    try {
        const { chargeId } = await params;

        if (!chargeId) {
            return NextResponse.json(
                { error: 'Charge ID is required' },
                { status: 400 }
            );
        }

        const omiseSecretKey = process.env.OMISE_SECRET_KEY;

        if (!omiseSecretKey) {
            return NextResponse.json(
                { error: 'Omise configuration not found' },
                { status: 500 }
            );
        }

        const omiseResponse = await fetch(`https://api.omise.co/charges/${chargeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${Buffer.from(omiseSecretKey + ':').toString('base64')}`,
                'Content-Type': 'application/json',
            },
        });

        if (!omiseResponse.ok) {
            const errorData: OmiseErrorResponse = await omiseResponse.json();
            return NextResponse.json(
                {
                    error: errorData.message || 'Failed to fetch charge status',
                    code: errorData.code
                },
                { status: omiseResponse.status }
            );
        }

        const chargeData: OmiseChargeResponse = await omiseResponse.json();
        return NextResponse.json({
            id: chargeData.id,
            status: chargeData.status,
            amount: chargeData.amount,
            currency: chargeData.currency,
            paid: chargeData.paid,
            authorized: chargeData.authorized,
            refunded: chargeData.refunded,
            failure_code: chargeData.failure_code,
            failure_message: chargeData.failure_message,
            created_at: chargeData.created_at,
            expires_at: chargeData.expires_at || chargeData.expired_at,
            expired: chargeData.expired,
            net: chargeData.net,
            fee: chargeData.fee,
            fee_vat: chargeData.fee_vat,
        });

    } catch (error) {
        console.error('Error fetching Omise charge status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
