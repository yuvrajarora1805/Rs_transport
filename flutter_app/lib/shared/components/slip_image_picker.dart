import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:file_picker/file_picker.dart';

class SlipImagePicker extends StatefulWidget {
  final String? initialBase64;
  final Function(String? base64Image) onImageSelected;
  final String label;

  const SlipImagePicker({
    super.key,
    this.initialBase64,
    required this.onImageSelected,
    this.label = 'Attach Weighbridge / Bilty Slip (Photo)',
  });

  @override
  State<SlipImagePicker> createState() => _SlipImagePickerState();
}

class _SlipImagePickerState extends State<SlipImagePicker> {
  String? _base64Image;
  bool _isDragging = false;

  @override
  void initState() {
    super.initState();
    _base64Image = widget.initialBase64;
  }

  @override
  void didUpdateWidget(SlipImagePicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialBase64 != oldWidget.initialBase64) {
      setState(() => _base64Image = widget.initialBase64);
    }
  }

  Future<void> _pickImage() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
        withData: true,
      );

      if (result != null && result.files.isNotEmpty) {
        final bytes = result.files.first.bytes;
        if (bytes != null) {
          final ext = result.files.first.extension ?? 'jpeg';
          final b64 = 'data:image/$ext;base64,${base64Encode(bytes)}';
          setState(() => _base64Image = b64);
          widget.onImageSelected(b64);
        }
      }
    } catch (e) {
      debugPrint('Error picking file: $e');
    }
  }

  Future<void> _pasteFromClipboard() async {
    try {
      final data = await Clipboard.getData(Clipboard.kTextPlain);
      if (data?.text != null && data!.text!.trim().isNotEmpty) {
        final text = data.text!.trim();
        String b64 = text;
        if (!b64.startsWith('data:image/')) {
          b64 = 'data:image/jpeg;base64,$b64';
        }
        setState(() => _base64Image = b64);
        widget.onImageSelected(b64);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Image attached from clipboard!')),
          );
        }
        return;
      }
      _pickImage();
    } catch (_) {
      _pickImage();
    }
  }

  void _clearImage() {
    setState(() => _base64Image = null);
    widget.onImageSelected(null);
  }

  void _showPreviewDialog() {
    if (_base64Image == null) return;
    final cleanB64 = _base64Image!.contains(',') ? _base64Image!.split(',')[1] : _base64Image!;
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Image.memory(base64Decode(cleanB64), fit: BoxFit.contain),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    ImageProvider? imgProvider;
    if (_base64Image != null) {
      final cleanB64 = _base64Image!.contains(',') ? _base64Image!.split(',')[1] : _base64Image!;
      try {
        imgProvider = MemoryImage(base64Decode(cleanB64));
      } catch (_) {}
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(widget.label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B))),
            if (_base64Image != null)
              InkWell(
                onTap: _clearImage,
                child: const Row(
                  children: [
                    Icon(Icons.close, size: 14, color: Color(0xFFE11D48)),
                    SizedBox(width: 4),
                    Text('Remove', style: TextStyle(fontSize: 11, color: Color(0xFFE11D48), fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
          ],
        ),
        const SizedBox(height: 8),
        if (_base64Image != null && imgProvider != null)
          _buildAttachedCard(imgProvider)
        else
          _buildDropZone(),
      ],
    );
  }

  Widget _buildAttachedCard(ImageProvider imgProvider) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          InkWell(
            onTap: _showPreviewDialog,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image(image: imgProvider, height: 60, width: 90, fit: BoxFit.cover),
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Image Slip Attached', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A))),
                SizedBox(height: 2),
                Text('Click thumbnail to view full image', style: TextStyle(fontSize: 10, color: Color(0xFF64748B))),
              ],
            ),
          ),
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              side: const BorderSide(color: Color(0xFFCBD5E1)),
            ),
            onPressed: _pickImage,
            icon: const Icon(Icons.refresh, size: 14),
            label: const Text('Change', style: TextStyle(fontSize: 11)),
          ),
        ],
      ),
    );
  }

  Widget _buildDropZone() {
    return DragTarget<String>(
      onWillAcceptWithDetails: (_) {
        setState(() => _isDragging = true);
        return true;
      },
      onLeave: (_) => setState(() => _isDragging = false),
      onAcceptWithDetails: (details) {
        setState(() => _isDragging = false);
        final data = details.data;
        if (data.isNotEmpty) {
          String b64 = data.startsWith('data:image/') ? data : 'data:image/jpeg;base64,$data';
          setState(() => _base64Image = b64);
          widget.onImageSelected(b64);
        }
      },
      builder: (context, candidateData, rejectedData) {
        return InkWell(
          onTap: _pickImage,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
            decoration: BoxDecoration(
              color: _isDragging ? const Color(0xFFEFF6FF) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _isDragging ? const Color(0xFF2563EB) : const Color(0xFFCBD5E1),
                width: _isDragging ? 2 : 1,
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.cloud_upload_outlined,
                  size: 32,
                  color: _isDragging ? const Color(0xFF2563EB) : const Color(0xFF64748B),
                ),
                const SizedBox(height: 8),
                Text(
                  _isDragging ? 'Drop Image Slip Here' : 'Drag & drop image slip, or click to browse',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: _isDragging ? const Color(0xFF2563EB) : const Color(0xFF334155),
                  ),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 10,
                  runSpacing: 8,
                  alignment: WrapAlignment.center,
                  children: [
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.white,
                        side: const BorderSide(color: Color(0xFFCBD5E1)),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: _pickImage,
                      icon: const Icon(Icons.file_upload_outlined, size: 15, color: Color(0xFF2563EB)),
                      label: const Text('Choose File', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    ),
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.white,
                        side: const BorderSide(color: Color(0xFFCBD5E1)),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: _pasteFromClipboard,
                      icon: const Icon(Icons.content_paste, size: 15, color: Color(0xFF059669)),
                      label: const Text('Paste (Ctrl+V)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
