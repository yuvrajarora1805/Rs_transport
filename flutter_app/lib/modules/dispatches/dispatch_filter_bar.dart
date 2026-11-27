import 'package:flutter/material.dart';

class DispatchFilterBar extends StatelessWidget {
  final List<Map<String, dynamic>> sources;
  final String? selectedSourceId;
  final ValueChanged<String?> onSourceChanged;
  final String search;
  final ValueChanged<String> onSearchChanged;
  final DateTime? startDate;
  final DateTime? endDate;
  final ValueChanged<DateTime?> onStartDateChanged;
  final ValueChanged<DateTime?> onEndDateChanged;
  final int count;
  final int total;

  const DispatchFilterBar({
    super.key,
    required this.sources,
    required this.selectedSourceId,
    required this.onSourceChanged,
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
    return Column(
      children: [
        // Top Filter Bar: Source selector
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            children: [
              const Icon(Icons.filter_list, size: 16, color: Color(0xFF64748B)),
              const SizedBox(width: 8),
              const Text('Filter by Source:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF334155))),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  height: 38,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFCBD5E1)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: selectedSourceId,
                      isExpanded: true,
                      hint: Text('All Booking Sources (${sources.length} Agents)', style: const TextStyle(fontSize: 12, color: Color(0xFF334155))),
                      items: [
                        const DropdownMenuItem(value: '', child: Text('All Booking Sources', style: TextStyle(fontSize: 12))),
                        ...sources.map((s) => DropdownMenuItem(value: s['id']?.toString(), child: Text(s['name'] ?? '', style: const TextStyle(fontSize: 12), overflow: TextOverflow.ellipsis))),
                      ],
                      onChanged: onSourceChanged,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        // Search and Date Filters Bar
        Container(
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
                      hintText: 'Search destination or source...',
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
        ),
      ],
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

