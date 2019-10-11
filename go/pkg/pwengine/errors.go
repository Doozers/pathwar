package pwengine

import "errors"

var (
	ErrNotImplemented  = errors.New("not implemented")
	ErrMissingArgument = errors.New("missing argument(s)")
	ErrInvalidArgument = errors.New("invalid argument(s)")
)