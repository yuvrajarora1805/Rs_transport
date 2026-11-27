import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class DropdownSearchItem {
  final String id;
  final String label;
  final String? subtitle;

  const DropdownSearchItem({
    required this.id,
    required this.label,
    this.subtitle,
  });
}

class SearchableDropdown extends StatelessWidget {
  final String? value;
  final String label;
  final String hint;
  final List<DropdownSearchItem> items;
  final ValueChanged<String?> onChanged;
  final bool isRequired;

  const SearchableDropdown({
    super.key,
    required this.value,
    required this.label,
    required this.hint,
    required this.items,
    required this.onChanged,
    this.isRequired = false,
  });

  DropdownSearchItem? get _selectedItem {
    if (value == null || value!.isEmpty) return null;
    final valStr = value.toString().trim();
    return items.cast<DropdownSearchItem?>().firstWhere(
          (it) => it != null && (it.id.trim() == valStr || it.label.trim().toLowerCase() == valStr.toLowerCase()),
          orElse: () => null,
        );
  }

  void _openSearchDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => _SearchDialog(
        title: label,
        items: items,
        initialValue: value,
        onSelected: (selectedId) {
          Navigator.of(ctx).pop();
          onChanged(selectedId);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final selected = _selectedItem;

    return InkWell(
      onTap: () => _openSearchDialog(context),
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: selected != null ? AppColors.primary : const Color(0xFFCBD5E1)),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (label.isNotEmpty)
                    Text(
                      isRequired ? '$label *' : label,
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                    ),
                  const SizedBox(height: 2),
                  Text(
                    selected != null ? selected.label : hint,
                    style: TextStyle(
                      fontSize: 13,
                      color: selected != null ? const Color(0xFF0F172A) : const Color(0xFF94A3B8),
                      fontWeight: selected != null ? FontWeight.bold : FontWeight.normal,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            if (selected != null)
              IconButton(
                icon: const Icon(Icons.clear, size: 16, color: Color(0xFF94A3B8)),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                onPressed: () => onChanged(null),
              ),
            const Icon(Icons.arrow_drop_down, size: 22, color: Color(0xFF64748B)),
          ],
        ),
      ),
    );
  }
}

class _SearchDialog extends StatefulWidget {
  final String title;
  final List<DropdownSearchItem> items;
  final String? initialValue;
  final ValueChanged<String> onSelected;

  const _SearchDialog({
    required this.title,
    required this.items,
    required this.initialValue,
    required this.onSelected,
  });

  @override
  State<_SearchDialog> createState() => _SearchDialogState();
}

class _SearchDialogState extends State<_SearchDialog> {
  final _searchCtrl = TextEditingController();
  List<DropdownSearchItem> _filtered = [];

  @override
  void initState() {
    super.initState();
    _filtered = widget.items;
    _searchCtrl.addListener(_onSearch);
  }

  @override
  void dispose() {
    _searchCtrl.removeListener(_onSearch);
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onSearch() {
    final q = _searchCtrl.text.toLowerCase().trim();
    setState(() {
      if (q.isEmpty) {
        _filtered = widget.items;
      } else {
        _filtered = widget.items.where((it) {
          final l = it.label.toLowerCase();
          final s = (it.subtitle ?? '').toLowerCase();
          return l.contains(q) || s.contains(q);
        }).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width >= 700;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: isDesktop ? 480 : double.infinity,
          maxHeight: 520,
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Select ${widget.title}',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _searchCtrl,
                autofocus: true,
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.search, size: 18),
                  hintText: 'Type to filter ${widget.title.toLowerCase()}...',
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: _filtered.isEmpty
                    ? const Center(
                        child: Text(
                          'No matching results found.',
                          style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                        ),
                      )
                    : ListView.separated(
                        itemCount: _filtered.length,
                        separatorBuilder: (_, __) => const Divider(height: 1),
                        itemBuilder: (ctx, i) {
                          final item = _filtered[i];
                          final isSelected = item.id == widget.initialValue;

                          return ListTile(
                            dense: true,
                            selected: isSelected,
                            selectedTileColor: const Color(0xFFEFF6FF),
                            title: Text(
                              item.label,
                              style: TextStyle(
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                color: isSelected ? AppColors.primary : AppColors.textMain,
                              ),
                            ),
                            subtitle: item.subtitle != null
                                ? Text(item.subtitle!, style: const TextStyle(fontSize: 11, color: AppColors.textMuted))
                                : null,
                            trailing: isSelected
                                ? const Icon(Icons.check, size: 18, color: AppColors.primary)
                                : null,
                            onTap: () => widget.onSelected(item.id),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
