import 'package:flutter/material.dart';

class TripFilterBar extends StatelessWidget {
  final String search;
  final ValueChanged<String> onSearchChanged;
  final DateTime? startDate;
  final DateTime? endDate;
  final ValueChanged<DateTime?> onStartDateChanged;
  final ValueChanged<DateTime?> onEndDateChanged;
  final int count;
  final int total;

  const TripFilterBar({
    super.key,
    required this.search,
    required this.onSearchChanged,
    required this.startDate,
    required this.endDate,
    required this.onStartDateChanged,
    required this.onEndDateChanged,
    required this.count,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
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
                  hintText: 'Search trip number, truck, party...',
                  hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                  prefixIcon: const Icon(Icons.search, size: 18, color: Color(0xFF64748B)),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: EdgeInsets.zero,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                ),
                style: const TextStyle(fontSize: 12),
                onChanged: onSearchChanged,
              ),
            ),
          ),
          const SizedBox(width: 12),
          _datePicker(context, 'From', startDate, onStartDateChanged),
          const SizedBox(width: 8),
          _datePicker(context, 'To', endDate, onEndDateChanged),
          const SizedBox(width: 16),
          Text('Showing $count of $total records', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
        ],
      ),
    );
  }

  Widget _datePicker(BuildContext context, String label, DateTime? date, ValueChanged<DateTime?> onChanged) {
    return InkWell(
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: date ?? DateTime.now(),
          firstDate: DateTime(2020),
          lastDate: DateTime(2035),
        );
        if (picked != null) onChanged(picked);
      },
      child: Container(
        height: 38,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFFCBD5E1)),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today_outlined, size: 14, color: Color(0xFF64748B)),
            const SizedBox(width: 6),
            Text(
              date != null ? '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}' : '$label: mm/dd/yyyy',
              style: TextStyle(fontSize: 11, color: date != null ? const Color(0xFF0F172A) : const Color(0xFF94A3B8)),
            ),
            if (date != null) ...[
              const SizedBox(width: 4),
              InkWell(onTap: () => onChanged(null), child: const Icon(Icons.close, size: 12, color: Color(0xFF94A3B8))),
            ],
          ],
        ),
      ),
    );
  }
}

