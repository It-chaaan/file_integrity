def envelope_responses(result, generator, request, public):
    for path_item in result.get("paths", {}).values():
        for operation in path_item.values():
            responses = operation.get("responses", {})
            for status_code, response in responses.items():
                content = response.get("content")
                if not content:
                    continue
                for media_type, media in content.items():
                    schema = media.get("schema")
                    if not schema:
                        continue
                    if str(status_code).startswith("2"):
                        media["schema"] = {
                            "type": "object",
                            "properties": {
                                "success": {"type": "boolean", "example": True},
                                "message": {"type": "string", "example": "OK"},
                                "data": schema,
                            },
                            "required": ["success", "message", "data"],
                        }
                    else:
                        media["schema"] = {
                            "type": "object",
                            "properties": {
                                "success": {"type": "boolean", "example": False},
                                "message": {"type": "string", "example": "Error"},
                                "errors": {"type": "object", "additionalProperties": True},
                            },
                            "required": ["success", "message"],
                        }
    return result
