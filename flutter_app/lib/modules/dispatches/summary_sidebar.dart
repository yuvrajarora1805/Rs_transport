import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class DispatchSummarySidebarWidget extends StatelessWidget {
  final bool isMultiMode;
  final String selectedTruckNo;
  final String selectedTruckOwner;
  final int totalBales;
  final String selectedSource;
  final String selectedDest;
  final int multiCount;
  final bool isSubmitting;
  final VoidCallback onSave;

  const DispatchSummarySidebarWidget({
    super.key,
    required this.isMultiMode,
    required this.selectedTruckNo,
    required this.selectedTruckOwner,
    required this.totalBales,
    required this.selectedSource,
    required this.selectedDest,
    required this.multiCount,
    required this.isSubmitting,
    required this.onSave,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppColors.border),
          ),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.local_shipping, size: 18, color: AppColors.primary),
                        SizedBox(width: 8),
                        Text('Dispatch Summary', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: isMultiMode ? AppColors.primary : AppColors.background,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        isMultiMode ? '$multiCount Trucks' : '1 Truck',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isMultiMode ? Colors.white : AppColors.textMain,
                        ),
                      ),
                    ),
                  ],
                ),
                const Divider(height: 24),
                _summaryRow('Selected Truck:', selectedTruckNo.isEmpty ? 'None' : selectedTruckNo, isBold: true),
                const SizedBox(height: 10),
                _summaryRow('Truck Owner:', selectedTruckOwner.isEmpty ? '-' : selectedTruckOwner),
                const SizedBox(height: 10),
                _summaryRow('Bales:', totalBales.toString(), isHighlight: true),
                const SizedBox(height: 10),
                _summaryRow('Source:', selectedSource.isEmpty ? 'None' : selectedSource),
                const SizedBox(height: 10),
                _summaryRow('Destination:', selectedDest.isEmpty ? '-' : selectedDest),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: isSubmitting ? null : onSave,
                    icon: isSubmitting
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.send, size: 16, color: Colors.white),
                    label: Text(
                      isSubmitting ? 'Saving...' : 'Save Dispatch',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        Card(
          elevation: 0,
          color: const Color(0xFFF0FDF4),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: Color(0xFFBBF7D0)),
          ),
          child: const Padding(
            padding: EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.info_outline, size: 18, color: Color(0xFF15803D)),
                SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Operational Rule', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF15803D))),
                      SizedBox(height: 4),
                      Text(
                        'Recording a dispatch books truck departure. Once loaded and weighed at the Dharamkanta/weighbridge, record weights in Step 2: Trips & Freight.',
                        style: TextStyle(fontSize: 11, color: Color(0xFF166534), height: 1.4),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _summaryRow(String label, String value, {bool isBold = false, bool isHighlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: TextStyle(
              fontSize: 13,
              fontWeight: (isBold || isHighlight) ? FontWeight.bold : FontWeight.w500,
              color: isHighlight ? AppColors.primary : AppColors.textMain,
            ),
          ),
        ),
      ],
    );
  }
}
