import 'package:flutter/material.dart';
import '../../components/layout/erp_header.dart';

class PaymentsScreen extends StatelessWidget {
  const PaymentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const ERPHeader(
          title: 'Accounts & Payments',
          subtitle: 'Record bank transfers, cheques & cash disbursements',
        ),
        Expanded(
          child: Center(
            child: Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              child: const Padding(
                padding: EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.credit_card, size: 48, color: Color(0xFF2563EB)),
                    SizedBox(height: 16),
                    Text('Payments Module', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    SizedBox(height: 8),
                    Text('Direct bank integration & payment disbursements', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

