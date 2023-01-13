import 'package:flutter/material.dart';

class SearchBar extends StatefulWidget {
  const SearchBar({super.key, required this.onSearch});
  final void Function(String text) onSearch;

  @override
  State<SearchBar> createState() => _SearchBarState();
}

class _SearchBarState extends State<SearchBar> {
  final _textController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Expanded(
            child: TextField(
              onSubmitted: widget.onSearch,
              controller: _textController,
              decoration: InputDecoration(
                hintText: 'search...',
                border: OutlineInputBorder(),
                suffixIcon: IconButton(
                  onPressed: () => _textController.clear(),
                  icon: Icon(Icons.clear),
                  splashRadius: 15,
                ),
              ),
            ),
          ),
          SizedBox(width: 20),
          ElevatedButton(
            onPressed: () => widget.onSearch(_textController.text),
            child: Icon(Icons.search),
          )
        ],
      ),
    );
  }
}
