import 'package:flutter/material.dart';
import '../../components/layout/erp_header.dart';

class ReportsScreen extends StatelessWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const ERPHeader(
          title: 'Reports & Analytics',
          subtitle: 'Financial statements, fleet profit/loss and diesel summaries',
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
                    Icon(Icons.description, size: 48, color: Color(0xFF059669)),
                    SizedBox(height: 16),
                    Text('Financial & Operational Reports', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    SizedBox(height: 8),
                    Text('Export CSV, Excel & PDF statement printouts', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
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

