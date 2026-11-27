import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';
import '../../shared/components/module_mobile_search_header.dart';
import 'payment_table_row.dart';
import 'payment_mobile_card.dart';

class PaymentsScreen extends StatefulWidget {
  const PaymentsScreen({super.key});

  @override
  State<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends State<PaymentsScreen> {
  List<Map<String, dynamic>> _payments = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadPayments();
  }

  Future<void> _loadPayments() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/payments');
      if (mounted && res.data is List) {
        setState(() => _payments = List<Map<String, dynamic>>.from(res.data));
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _payments.where((p) {
      final q = _search.toLowerCase();
      final truck = (p['truck_no'] ?? '').toString().toLowerCase();
      final payee = (p['paid_to'] ?? '').toString().toLowerCase();
      final ref = (p['ref_no'] ?? '').toString().toLowerCase();
      return truck.contains(q) || payee.contains(q) || ref.contains(q);
    }).toList();

    return LayoutBuilder(
      builder: (context, constraints) {
        final isMobile = constraints.maxWidth < 768;

        return Column(
          children: [
            ERPHeader(
              title: isMobile ? 'Payments' : 'Payment Management',
              subtitle: isMobile
                  ? 'Disbursement Vouchers & UTR'
                  : 'Freight Disbursement Vouchers, Bank Transfers & UTR Traceability',
            ),
            Expanded(
              child: Padding(
                padding: EdgeInsets.all(isMobile ? 8 : 16),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: const [
                      BoxShadow(color: Color(0x05000000), blurRadius: 4, offset: Offset(0, 1)),
                    ],
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    children: [
                      isMobile
                          ? ModuleMobileSearchHeader(
                              search: _search,
                              onSearchChanged: (v) => setState(() => _search = v),
                              count: filtered.length,
                              total: _payments.length,
                              hintText: 'Search by payee, truck, or UTR...',
                            )
                          : _buildDesktopSearchHeader(filtered.length),
                      if (!isMobile) _buildTableHeader(),
                      Expanded(
                        child: _loading
                            ? const Center(child: CircularProgressIndicator())
                            : filtered.isEmpty
                                ? const Center(
                                    child: Text(
                                      'No payment records recorded yet',
                                      style: TextStyle(color: AppColors.textMuted),
                                    ),
                                  )
                                : ListView.builder(
                                    itemCount: filtered.length,
                                    itemBuilder: (ctx, i) => isMobile
                                        ? PaymentMobileCard(payment: filtered[i])
                                        : PaymentTableRow(payment: filtered[i]),
                                  ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildDesktopSearchHeader(int count) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(
        color: Color(0xFFF8FAFC),
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Row(
        children: [
          Expanded(
            child: SizedBox(
              height: 38,
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search by payee, truck plate, or UTR number...',
                  hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                  prefixIcon: const Icon(Icons.search, size: 18, color: Color(0xFF64748B)),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: EdgeInsets.zero,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                  ),
                ),
                style: const TextStyle(fontSize: 12),
                onChanged: (v) => setState(() => _search = v),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Text(
            'Showing $count of ${_payments.length} records',
            style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
          ),
        ],
      ),
    );
  }

  Widget _buildTableHeader() {
    return Container(
      color: const Color(0xFFF8FAFC),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: const Row(
        children: [
          SizedBox(
            width: 110,
            child: Text(
              'PAYMENT DATE',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)),
            ),
          ),
          SizedBox(
            width: 140,
            child: Text(
              'TRUCK NO',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)),
            ),
          ),
          SizedBox(
            width: 120,
            child: Text(
              'AMOUNT PAID',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)),
            ),
          ),
          SizedBox(
            width: 110,
            child: Text(
              'PAYMENT MODE',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)),
            ),
          ),
          SizedBox(
            width: 130,
            child: Text(
              'UTR / REF NO',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              'RECIPIENT / PAYEE',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              'REMARKS',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)),
            ),
          ),
        ],
      ),
    );
  }
}
