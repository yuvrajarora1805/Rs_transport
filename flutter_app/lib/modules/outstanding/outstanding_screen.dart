import 'package:flutter/material.dart';
import '../../components/layout/erp_header.dart';

class OutstandingScreen extends StatelessWidget {
  const OutstandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const ERPHeader(
          title: 'Outstanding Balances',
          subtitle: 'Track uncollected party freights and payable balances',
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
                    Icon(Icons.receipt_long, size: 48, color: Color(0xFFDC2626)),
                    SizedBox(height: 16),
                    Text('Outstanding Balances Ledger', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    SizedBox(height: 8),
                    Text('Party aging, unsettled trucks & deficit tracking', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
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

