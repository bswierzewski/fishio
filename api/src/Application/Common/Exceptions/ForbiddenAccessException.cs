﻿namespace Fishio.Application.Common.Exceptions;

public class ForbiddenAccessException : Exception
{
    public ForbiddenAccessException() : base() { }

    public ForbiddenAccessException(string error) : base(error) { }
}
